<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariableLeadSource extends Model
{
    use HasFactory;

    // Specify the table name (optional if it matches Laravel's naming convention)
    protected $table = 'variable_lead_sources';

    // Mass-assignable attributes
    protected $fillable = [
        'ls_name',
    ];

    // Add timestamps (optional if you want to ensure explicit handling)
    public $timestamps = true;
}