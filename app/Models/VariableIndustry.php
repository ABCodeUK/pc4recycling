<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariableIndustry extends Model
{
    use HasFactory;

    // Specify the table name (optional if it matches Laravel's naming convention)
    protected $table = 'variable_industries';

    // Mass-assignable attributes
    protected $fillable = [
        'in_name',
    ];

    // Add timestamps (optional if you want to ensure explicit handling)
    public $timestamps = true;
}