<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserStaff extends Model
{
    use HasFactory;

    protected $table = 'users_staff';

    protected $fillable = [
        'user_id',
        'role_id',
        // Add other fields as needed
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function role()
    {
        return $this->belongsTo(StaffRole::class, 'role_id');
    }
}