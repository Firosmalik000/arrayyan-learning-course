<?php

namespace App\Models;

use Database\Factories\BankSoalResourceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankSoalResource extends Model
{
    /** @use HasFactory<BankSoalResourceFactory> */
    use HasFactory;

    protected $fillable = ['bank_soal_id', 'label', 'file_path', 'file_name', 'destination_url', 'sort_order'];

    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }

    public function bankSoal(): BelongsTo
    {
        return $this->belongsTo(BankSoal::class);
    }
}
