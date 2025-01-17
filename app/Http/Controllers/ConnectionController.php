<?php

namespace App\Http\Controllers;

use App\Models\Connection;
use App\Http\Controllers\ChatGPTController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ConnectionController extends Controller
{
    protected $chatGPTController;

    public function __construct(ChatGPTController $chatGPTController)
    {
        $this->chatGPTController = $chatGPTController;
    }

    /**
     * Display the connections page.
     */
    public function index()
    {
        // Fetch all connections from the database
        $connections = Connection::all();

        // Pass data to the Inertia template
        return inertia('Settings/Connections/Connections', [
            'connections' => $connections,
        ]);
    }

    /**
     * Save or update a connection.
     */
    public function connect(Request $request, $type)
    {
        $validated = $request->validate([
            'host' => 'nullable|string|max:255',
            'port' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'database' => 'nullable|string|max:255',
            'api_key' => 'nullable|string|max:255',
        ]);

        // Find or create the connection record for this type
        $connection = Connection::firstOrNew(['type' => $type]);

        // Update the connection details
        $connection->fill($validated);
        $connection->connected = false;

        // Test the connection
        if ($type === 'aitken') {
            $connection->connected = $this->testDatabaseConnection($validated);
        } elseif ($type === 'chatgpt') {
            $connection->connected = $this->chatGPTController->connect($validated['api_key']);
        } elseif ($type === 'IMEI') {
            $connection->connected = $this->testIMEIConnection($validated['api_key']);
        }

        $connection->save();

        if ($connection->connected) {
            return response()->json([
                'message' => ucfirst($type) . ' connected successfully!',
                'connection' => $connection,
            ], 200);
        }

        return response()->json([
            'message' => 'Failed to connect to ' . ucfirst($type) . '. Please check your details.',
            'connection' => $connection,
        ], 400);
    }

    /**
     * Test a connection.
     */
    public function test(Request $request, $type)
    {
        $validated = $request->validate([
            'host' => 'nullable|string|max:255',
            'port' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'database' => 'nullable|string|max:255',
            'api_key' => 'nullable|string|max:255',
        ]);

        $isConnected = false;

        if ($type === 'aitken') {
            $isConnected = $this->testDatabaseConnection($validated);
        } elseif ($type === 'chatgpt') {
            $isConnected = $this->chatGPTController->testConnection($validated['api_key']);
        } elseif ($type === 'IMEI') {
            $isConnected = $this->testIMEIConnection($validated['api_key']);
        }

        return response()->json(['connected' => $isConnected], $isConnected ? 200 : 400);
    }

    /**
     * Test a MySQL database connection.
     */
    private function testDatabaseConnection($details)
    {
        try {
            config([
                'database.connections.temp_mysql' => [
                    'driver' => 'mysql',
                    'host' => $details['host'],
                    'port' => $details['port'],
                    'database' => $details['database'],
                    'username' => $details['username'],
                    'password' => $details['password'],
                ],
            ]);

            DB::connection('temp_mysql')->getPdo();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Test the IMEI API connection.
     */
    private function testIMEIConnection($apiKey)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->get('https://dash.imei.info/api/account/account');

            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}