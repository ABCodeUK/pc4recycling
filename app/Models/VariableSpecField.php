<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariableSpecField extends Model
{
    use HasFactory;

    protected $table = 'variable_spec_fields'; // Specify the correct table name

    protected $fillable = [
        'spec_name',
        'spec_order',        
        'spec_default',
    ];
}
