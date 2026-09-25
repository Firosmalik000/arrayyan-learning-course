<?php

namespace App\Console\Commands;

use App\Jobs\SendInvoiceNotification;
use App\Models\Invoice;
use App\Support\InvoiceService;
use Illuminate\Console\Command;

class ExpireOverdueInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:expire-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tandai invoice unpaid yang lewat jatuh tempo sebagai expired.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $expired = 0;

        Invoice::query()
            ->with(['student:id,name,parent_contact', 'registration:id,student_name,parent_contact'])
            ->where('status', Invoice::STATUS_UNPAID)
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', now()->toDateString())
            ->orderBy('id')
            ->eachById(function (Invoice $invoice) use (&$expired): void {
                $invoice->update(['status' => Invoice::STATUS_EXPIRED]);
                $expired++;

                [$contact, $name] = InvoiceService::resolveRecipient($invoice);

                if ($contact !== '') {
                    SendInvoiceNotification::dispatch(
                        event: 'expired',
                        recipient: $contact,
                        name: $name,
                        invoiceNo: $invoice->invoice_no,
                        amount: 'Rp '.number_format((float) $invoice->amount, 0, ',', '.'),
                        dueDate: $invoice->due_date?->format('d M Y'),
                        invoiceId: $invoice->id,
                    );
                }
            });

        $this->info("Berhasil menandai {$expired} invoice sebagai expired.");

        return self::SUCCESS;
    }
}
