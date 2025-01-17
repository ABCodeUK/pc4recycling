<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariableLeadSource extends Model
{
    use HasFactory;

    // Specify the table name (optional if it matches Laravel's naming convention)
    protected $table = 'variable_lead_sources';

    // Mass-assignable attributes
    protected $fillable = [
        'ls_name',
    ];

        /**
     * Relationship: Users assigned to this role
     *
     * Links the industry to the users via the users_client pivot table.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function users()
    {
        return $this->hasMany(UserClient::class, 'lead_source_id', 'id')
            ->whereHas('user', function ($query) {
                $query->where('type', 'Client');
            })
            ->with('user'); // Include user details
    }

    /**
     * Relationship: Client Details
     *
     * Links to the users_clients table to fetch client-specific details for this role.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function clientDetails()
    {
        return $this->hasMany(UserClient::class, 'lead_source_id', 'id');
    }
}