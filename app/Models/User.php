<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'position',
        'landline',
        'mobile',
        'type',      // Differentiates between Client and Staff
        'active',    // Status management
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'active' => 'boolean', // Cast 'active' to boolean
        'password' => 'hashed',
    ];

    /* -------------------------------------------------------------------------- */
    /*                              STAFF RELATIONSHIPS                           */
    /* -------------------------------------------------------------------------- */

    /**
     * Scope to filter Staff users.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeStaff($query)
    {
        return $query->where('type', 'Staff');
    }

    /**
     * Relationship: Staff Details
     *
     * Links to the users_staff table for additional staff-specific data.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function staffDetails()
    {
        return $this->hasOne(UserStaff::class, 'user_id');
    }

    /**
     * Relationship: Role
     *
     * For users of type Staff, links to the role through the users_staff table.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOneThrough|null
     */
    public function role()
    {
        if ($this->type === 'Staff') {
            return $this->hasOneThrough(
                StaffRole::class,   // Final model
                UserStaff::class,   // Intermediate model
                'user_id',          // Foreign key on users_staff
                'id',               // Foreign key on users_roles
                'id',               // Local key on users
                'role_id'           // Local key on users_staff
            );
        }

        return null;
    }

    /* -------------------------------------------------------------------------- */
    /*                              CLIENT RELATIONSHIPS                           */
    /* -------------------------------------------------------------------------- */

    /**
     * Scope to filter Client users.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeClient($query)
    {
        return $query->where('type', 'Client');
    }

    /**
     * Relationship: Client Details
     *
     * Links to the users_client table for additional client-specific data.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function clientDetails()
    {
        return $this->hasOne(UserClient::class, 'user_id');
    }

    /**
     * Relationship: Industry
     *
     * For users of type Client, links to the industry through the users_clients table.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOneThrough|null
     */
    public function industry()
    {
        if ($this->type === 'Client') {
            return $this->hasOneThrough(
                VariableIndustry::class,   // Final model
                UserClient::class,   // Intermediate model
                'user_id',          // Foreign key on users_clients
                'id',               // Foreign key on variable_industries
                'id',               // Local key on users
                'industry_id'           // Local key on users_clients
            );
        }

        return null;
    }

     /**
     * Relationship: Lead Source
     *
     * For users of type Client, links to the lead source through the users_clients table.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOneThrough|null
     */
    public function leadSource()
    {
        if ($this->type === 'Client') {
            return $this->hasOneThrough(
                VariableLeadSource::class,   // Final model
                UserClient::class,   // Intermediate model
                'user_id',          // Foreign key on users_clients
                'id',               // Foreign key on variable_lead_source
                'id',               // Local key on users
                'lead_source_id'           // Local key on users_cliens
            );
        }

        return null;
    }

     /**
     * Relationship: Customer Type
     *
     * For users of type Client, links to the lead source through the users_clients table.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOneThrough|null
     */
    public function customerType()
    {
        if ($this->type === 'Client') {
            return $this->hasOneThrough(
                VariableCustomerType::class,   // Final model
                UserClient::class,   // Intermediate model
                'user_id',          // Foreign key on users_clients
                'id',               // Foreign key on variable_lead_source
                'id',               // Local key on users
                'customer_type_id'           // Local key on users_cliens
            );
        }

        return null;
    }

    /**
     * Helper: Full Address
     *
     * Combines address details into a single formatted string.
     *
     * @return string|null
     */
    public function getFullAddressAttribute()
    {
        return $this->clientDetails->full_address ?? null;
    }
}