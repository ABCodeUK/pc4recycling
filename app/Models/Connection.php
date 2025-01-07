<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Connection extends Model
{
    use HasFactory;

    // Specify the table name (if not plural of the model name)
    protected $table = 'connections';

    // Allow mass assignment for the specified fields
    protected $fillable = [
        'type',
        'host',
        'port',
        'username',
        'password',
        'database',
        'api_key',
        'connected',
    ];

    // Hidden fields when returned as JSON (e.g., password)
    protected $hidden = ['password', 'api_key'];
}
