<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffRole extends Model
{
    use HasFactory;

    // Specify the table name
    protected $table = 'users_roles';

    // Mass-assignable attributes
    protected $fillable = ['name'];

    // Add timestamps (set to false if your table doesn't include created_at/updated_at)
    public $timestamps = true;

    /**
     * Relationship: Users assigned to this role
     *
     * Links the role to the users via the users_staff pivot table.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function users()
    {
        return $this->hasMany(UserStaff::class, 'role_id', 'id')
            ->whereHas('user', function ($query) {
                $query->where('type', 'Staff');
            })
            ->with('user'); // Include user details
    }

    /**
     * Relationship: Staff Details
     *
     * Links to the users_staff table to fetch staff-specific details for this role.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function staffDetails()
    {
        return $this->hasMany(UserStaff::class, 'role_id', 'id');
    }
}