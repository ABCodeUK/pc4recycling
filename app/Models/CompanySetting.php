<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model  // Renamed from CompanyDocument
{
    protected $table = 'company_settings';

    protected $fillable = [
        'document_name',
        'document_description',
        'date_from',
        'date_to',
        'document_url',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'date_from' => 'date',
        'date_to' => 'date',
        'updated_at' => 'datetime',
    ];
}
