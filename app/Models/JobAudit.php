<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobAudit extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'clients_jobs_audit';

    protected $fillable = [
        'job_id',
        'staff_id',
        'content',
        'is_system'
    ];

    protected $casts = [
        'is_system' => 'string'  // Changed from 'boolean' to 'string'
    ];

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function job()
    {
        return $this->belongsTo(Job::class, 'job_id');
    }
}