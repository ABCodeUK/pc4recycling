<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariableDataSanitisation extends Model
{
    use HasFactory;

    protected $table = 'variable_data_sanitisation';

    protected $fillable = [
        'ds_name',
    ];

    public function jobs()
    {
        return $this->hasMany(Job::class, 'data_sanitisation', 'id');
    }
}