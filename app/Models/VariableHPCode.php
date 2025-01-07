<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariableHPCode extends Model
{
    use HasFactory;

    protected $table = 'variable_hp_codes'; // Specify the correct table name

    protected $fillable = [
        'hp_code',
        'hp_type',
        'hp_description',
    ];
}
