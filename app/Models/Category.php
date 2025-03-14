<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'default_weight',
        'ewc_code_id',
        'physical_form',
        'concentration',
        'chemical_component',
        'container_type',
    ];

    /**
     * Relationship to EWC Code.
     */
    public function ewcCode()
    {
        return $this->belongsTo(VariableEwcCode::class, 'ewc_code_id');
    }

    /**
     * Relationship to HP Codes.
     */
    public function hpCodes()
    {
        return $this->belongsToMany(
            VariableHPCode::class,
            'category_hp_codes',
            'category_id',
            'hp_code_id' // Correct column name
        );
    }

    /**
     * Relationship to Spec Fields.
     */
    public function specFields()
    {
        return $this->belongsToMany(
            VariableSpecField::class,
            'category_spec_fields',
            'category_id',
            'spec_field_id' // Correct column name
        );
    }

    /**
     * Relationship to Sub Categories.
     */
    // Relationship looks correct
    public function subCategories()
    {
        return $this->hasMany(CategorySub::class, 'parent_id');
    }
}