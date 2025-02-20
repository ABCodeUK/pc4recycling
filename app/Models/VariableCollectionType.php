<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariableCollectionType extends Model
{
    use HasFactory;

    protected $table = 'variable_collection_types';

    protected $fillable = [
        'colt_name',
        'colt_description', // Add this line if it's not already there
    ];

    public function users()
    {
        return $this->hasMany(UserClient::class, 'collection_type_id', 'id')
            ->whereHas('user', function ($query) {
                $query->where('type', 'Client');
            })
            ->with('user');
    }

    public function clientDetails()
    {
        return $this->hasMany(UserClient::class, 'collection_type_id', 'id');
    }
}