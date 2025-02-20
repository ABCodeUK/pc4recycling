<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserClient extends Model
{
    use HasFactory;

    protected $table = 'users_clients';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'address',
        'address_2',
        'town_city',
        'county',
        'postcode',
        'contact_name',
        'contact_position',
        'lead_source_id',
        'industry_id',
        'customer_type_id',
        'sic_code',
        'customer_notes',
    ];

    /**
     * Relationship: User
     *
     * Links back to the User model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relationship: Lead Source
     *
     * Links to the VariableLeadSource model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function leadSource()
    {
        return $this->belongsTo(VariableLeadSource::class, 'lead_source_id');
    }

    /**
     * Relationship: Industry
     *
     * Links to the VariableIndustry model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function industry()
    {
        return $this->belongsTo(VariableIndustry::class, 'industry_id');
    }

    /**
     * Relationship: Customer Type
     *
     * Links to the VariableCustomerType model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function customerType()
    {
        return $this->belongsTo(VariableCustomerType::class, 'customer_type_id');
    }

    /**
     * Accessor: Full Address
     *
     * Combines address fields into a single string.
     *
     * @return string
     */
    public function getFullAddressAttribute()
    {
        return "{$this->address}, {$this->address_2}, {$this->town_city}, {$this->county}, {$this->postcode}";
    }

}