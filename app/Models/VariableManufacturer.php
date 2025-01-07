<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariableManufacturer extends Model
{
    use HasFactory;

    protected $table = 'variable_manufacturers'; // Specify the correct table name

    protected $fillable = [
        'manufacturer_name',
        'manufacturer_logo',        
        'manufacturer_url',
    ];
}
