<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffRole extends Model
{
    use HasFactory;

    // Specify the table name (optional if it matches Laravel's naming convention)
    protected $table = 'users_roles'; // Update to match your roles table

    // Mass-assignable attributes
    protected $fillable = [
        'name', // Assuming 'name' is the column for role names
    ];

    // Add timestamps (optional, set false if the table doesn't have created_at and updated_at)
    public $timestamps = true;
}