<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariableEwcCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'ewc_code',
        'ea_description',
    ];
}
