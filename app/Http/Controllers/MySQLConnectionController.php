<?php

namespace App\Http\Controllers;

use App\Models\Connection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MySQLConnectionController extends Controller
{
    /**
     * Get MySQL connection details.
     */
    public function getConnection()
    {
        $connection = Connection::where('type', 'mysql')->first();

        if ($connection) {
            return response()->json([
                'connected' => $connection->connected,
                'host' => $connection->host,
                'port' => $connection->port,
                'database' => $connection->database,
                'username' => $connection->username,
            ]);
        }

        return response()->json(['connected' => false]);
    }

    /**
     * Test MySQL connection.
     */
 public function testConnection(Request $request)
{
    try {
        $connection = Connection::where('type', 'mysql')->first();

        if ($connection && $connection->connected) {
            // Use saved connection details
            $host = $connection->host;
            $port = $connection->port;
            $database = $connection->database;
            $username = $connection->username;
            $password = $connection->password;
        } else {
            // Validate request for first-time connection test
            $request->validate([
                'host' => 'required|string',
                'port' => 'required|integer',
                'database' => 'required|string',
                'username' => 'required|string',
                'password' => 'required|string',
            ]);

            $host = $request->host;
            $port = $request->port;
            $database = $request->database;
            $username = $request->username;
            $password = $request->password;
        }

        // Test connection
        config([
            'database.connections.dynamic' => [
                'driver' => 'mysql',
                'host' => $host,
                'port' => $port,
                'database' => $database,
                'username' => $username,
                'password' => $password,
            ]
        ]);

        DB::connection('dynamic')->getPdo(); // Will throw an exception if connection fails

        return response()->json(['connected' => true, 'message' => 'Successfully connected to MySQL.'], 200);
    } catch (\Exception $e) {
        return response()->json(['connected' => false, 'message' => 'Connection failed: ' . $e->getMessage()], 400);
    }
}

    /**
     * Save MySQL connection details.
     */
public function saveConnection(Request $request)
{
    $request->validate([
        'host' => 'required|string',
        'port' => 'required|integer',
        'database' => 'required|string',
        'username' => 'required|string',
        'password' => 'required|string',
    ]);

    try {
        // Test database connection before saving
        config([
            'database.connections.dynamic' => [
                'driver' => 'mysql',
                'host' => $request->host,
                'port' => $request->port,
                'database' => $request->database,
                'username' => $request->username,
                'password' => $request->password,
            ]
        ]);

        DB::connection('dynamic')->getPdo(); // Will throw an exception if connection fails

        // Save connection details after a successful test
        Connection::updateOrCreate(
            ['type' => 'mysql'],
            [
                'host' => $request->host,
                'port' => $request->port,
                'database' => $request->database,
                'username' => $request->username,
                'password' => $request->password,
                'connected' => true,
            ]
        );

        return response()->json(['connected' => true, 'message' => 'MySQL connection saved successfully.'], 200);
    } catch (\Exception $e) {
        return response()->json([
            'connected' => false,
            'message' => 'Failed to save connection: ' . $e->getMessage(),
        ], 400);
    }
}

    /**
     * Disconnect MySQL connection.
     */
    public function disconnect()
    {
        try {
            $connection = Connection::where('type', 'mysql')->first();
            if ($connection) {
                $connection->update([
                    'host' => null,
                    'port' => null,
                    'database' => null,
                    'username' => null,
                    'password' => null,
                    'connected' => false,
                ]);
            }

            return response()->json(['message' => 'Disconnected from MySQL.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}