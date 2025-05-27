<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobItem extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'item_number',
        'job_id',
        'quantity',
        'category_id',
        'sub_category_id',
        'make',
        'model',
        'serial_number',
        'asset_tag',
        'weight',
        'specification',
        'erasure_required',
        'image_path',
        'processing_make',
        'processing_model',
        'processing_serial_number',
        'processing_asset_tag',
        'processing_weight',
        'processing_specification',
        'processing_erasure_required',
        'processing_data_status',
        'item_status', 
        'added',

    ];

    // Add the new constant for item status options
    public const ITEM_STATUS_OPTIONS = [
        'Reusing',
        'Repurposing Parts',
        'Recycling',
        'N/A'
    ];

    // Add the enum values as a constant
    public const DATA_STATUS_OPTIONS = [
        'Destroyed (Physical Destruction)',
        'Wiped Aiken',
        'Wiped Ziperase',
        'No Erasure Required',
        'Drive Removed by Client'
    ];

    // Add this to define the enum values
    public const ERASURE_OPTIONS = [
        'Yes',
        'No',
        'N/A',
        'Unknown'
    ];

    // Change this relationship back to Job since that's what we're using
    public function job()
    {
        return $this->belongsTo(Job::class, 'job_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory()
    {
        return $this->belongsTo(CategorySub::class, 'sub_category_id');
    }

    protected $casts = [
        'processing_specification' => 'json',
    ];
}