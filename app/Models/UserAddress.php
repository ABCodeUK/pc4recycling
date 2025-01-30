<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    use HasFactory;

    protected $table = 'users_addresses'; // Explicitly set the table name
    protected $fillable = ['address', 'town_city', 'county', 'postcode', 'parent_id'];

    public function parentUser()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }
}