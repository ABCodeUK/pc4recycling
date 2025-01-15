<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use function Laravel\Prompts\clear;

class VariableHPCode extends Model
{
    use HasFactory;

    protected $table = 'variable_hp_codes'; // Specify the correct table name

    protected $fillable = [
        'hp_code',
        'hp_type',
        'hp_description',
    ];

    /**
     * Relationship with the Category model.
     * Defines a many-to-many relationship.
     */
    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_hp_code');
    }
}