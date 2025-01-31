<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Job extends Model
{
    use HasFactory;

    protected $table = 'clients_jobs';

    protected $fillable = [
        'job_id',
        'client_id',
        'collection_date',
        'job_status',
        'staff_collecting',
        'vehicle',
        'address',
        'town_city',
        'postcode',
        'onsite_contact',
        'onsite_number',
        'onsite_email',
        'collection_type',
        'data_sanitisation',
        'sla',
        'instructions'
    ];

    protected $casts = [
        'collection_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Define the valid status options
    public static $statuses = [
        'Needs Scheduling',
        'Request Pending',
        'Scheduled',
        'Postponed',
        'Collected',
        'Processing',
        'Complete',
        'Canceled'
    ];

    // Define the valid collection types
    public static $collectionTypes = [
        'IT Asset Disposal (ITAD)',
        'IT Asset Remarketing (Resale)',
        'IT Asset Redeployment'
    ];

    // Define the valid sanitisation options
    public static $sanitisationOptions = [
        'Data Erasue Higher',
        'Data Erasure Lower',
        'No Sanitisation Required',
        'Off-site Hard Drive Punching',
        'Off-site Hard Drive Shredding',
        'on-site Hard Drive Punching',
        'on-site Hard Drive Shredding'
    ];

    public static function generateJobId()
    {
        $year = date('y');  // This will give us '25' for 2025
        $prefix = "J{$year}";
        
        // Get the latest job number for the current year
        $latestJob = self::where('job_id', 'like', $prefix . '%')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$latestJob) {
            // If no jobs exist for this year, start with 001
            return $prefix . '001';
        }

        // Extract the numeric portion and increment
        $currentNumber = (int)substr($latestJob->job_id, 3);
        $nextNumber = $currentNumber + 1;
        
        // Format with leading zeros (3 digits)
        return $prefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function scopeCollections($query)
    {
        return $query->whereIn('job_status', ['Needs Scheduling', 'Request Pending', 'Scheduled', 'Postponed']);
    }

    public function scopeProcessing($query)
    {
        return $query->whereIn('job_status', ['Collected', 'Processing']);
    }

    public function scopeCompleted($query)
    {
        return $query->whereIn('job_status', ['Complete', 'Canceled']);
    }

    public function isEditable()
    {
        return !in_array($this->job_status, ['Complete', 'Canceled']);
    }
}