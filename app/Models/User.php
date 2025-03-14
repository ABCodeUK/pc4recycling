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
        'landline',
        'mobile',
        'type',
        'active',
        'parent_id',
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
        'password' => 'hashed',
        'active' => 'boolean',
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
    // Add or update these methods in your User model
    
    /**
     * Get the staff details associated with the user.
     */
    public function staffDetails()
    {
        return $this->hasOne(UserStaff::class, 'user_id');
    }
    
    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['role_debug'];
    
    /**
     * Get the role debug information
     */
    public function getRoleDebugAttribute()
    {
        if ($this->type !== 'Staff') {
            return null;
        }
        
        $staffDetails = $this->staffDetails;
        
        if (!$staffDetails) {
            return ['message' => 'No staff details found'];
        }
        
        return [
            'role_id' => $staffDetails->role_id,
            'role_name' => $staffDetails->role ? $staffDetails->role->name : null
        ];
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
     * Relationship to Addresses.
     */
    public function userAddresses()
    {
        return $this->hasMany(UserAddress::class, 'parent_id');
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

    // Add this relationship if it doesn't exist
    public function jobs()
    {
        return $this->hasMany(Job::class, 'client_id');
    }

public function subClients()
{
    return $this->hasMany(User::class, 'parent_id');
}

public function parentClient()
{
    return $this->belongsTo(User::class, 'parent_id');
}
}