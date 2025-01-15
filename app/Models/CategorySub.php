<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategorySub extends Model
{
    use HasFactory;

    protected $table = 'category_sub'; // Explicitly set the table name
    protected $fillable = ['name', 'default_weight', 'parent_id'];

    public function parentCategory()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }
}