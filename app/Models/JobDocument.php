<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}