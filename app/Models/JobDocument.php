<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class JobDocument extends Model
{
    protected $fillable = [
        'job_id',
        'document_type',
        'original_filename',
        'stored_filename',
        'file_path',
        'mime_type',
        'file_size',
        'uuid'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($document) {
            $document->uuid = Str::uuid();
        });
    }

    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}