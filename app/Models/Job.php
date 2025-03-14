<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;  // Add this line

class Job extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $perPage = 20;

    protected $table = 'clients_jobs';

    protected $fillable = [
        'job_id',
        'client_id',
        'collection_date',
        'job_status',
        'staff_collecting',
        'vehicle',
        'address',
        'address_2',
        'town_city',
        'postcode',
        'onsite_contact',
        'onsite_number',
        'onsite_email',
        'collection_type',
        'data_sanitisation',
        'sla',
        'instructions',
        'equipment_location',
        'building_access',
        'collection_route',
        'parking_loading',
        'equipment_readiness'
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
        
        // Get the latest job number for the current year, including soft deleted records
        $latestJob = self::withTrashed()  // This will include deleted records
            ->where('job_id', 'like', $prefix . '%')
            ->orderBy('job_id', 'desc')
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

    public function documents()
    {
        return $this->hasMany(JobDocument::class);
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

    public function collectionType()
    {
        return $this->belongsTo(VariableCollectionType::class, 'collection_type');
    }

    public function dataSanitisation()
    {
        return $this->belongsTo(VariableDataSanitisation::class, 'data_sanitisation');
    }
    // Add this relationship if it's not already there
    public function items()
    {
        return $this->hasMany(JobItem::class);
    }
}