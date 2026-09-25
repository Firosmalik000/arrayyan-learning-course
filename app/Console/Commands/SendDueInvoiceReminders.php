<?php

namespace App\Console\Commands;

use App\Jobs\SendInvoiceNotification;
use App\Models\Invoice;
use App\Models\NotificationLog;
use App\Support\InvoiceService;
use Illuminate\Console\Command;

class SendDueInvoiceReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:send-due-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim pengingat H-1 untuk invoice yang jatuh tempo besok.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $reminded = 0;
        $tomorrow = now()->addDay()->toDateString();

        Invoice::query()
            ->with(['student:id,name,parent_contact', 'registration:id,student_name,parent_contact'])
            ->whereIn('status', [Invoice::STATUS_UNPAID, Invoice::STATUS_PENDING])
            ->whereDate('due_date', $tomorrow)
            ->orderBy('id')
            ->eachById(function (Invoice $invoice) use (&$reminded): void {
                $alreadyReminded = NotificationLog::query()
                    ->where('event', 'invoice_due')
                    ->where('registration_type', 'invoice')
                    ->where('registration_id', $invoice->id)
                    ->where('created_at', '>=', now()->subDay())
                    ->exists();

                if ($alreadyReminded) {
                    return;
                }

                [$contact, $name] = InvoiceService::resolveRecipient($invoice);

                if ($contact === '') {
                    return;
                }

                SendInvoiceNotification::dispatch(
                    event: 'due',
                    recipient: $contact,
                    name: $name,
                    invoiceNo: $invoice->invoice_no,
                    amount: 'Rp '.number_format((float) $invoice->amount, 0, ',', '.'),
                    dueDate: $invoice->due_date?->format('d M Y'),
                    invoiceId: $invoice->id,
                );
                $reminded++;
            });

        $this->info("Berhasil mengirim {$reminded} pengingat jatuh tempo.");

        return self::SUCCESS;
    }
}
