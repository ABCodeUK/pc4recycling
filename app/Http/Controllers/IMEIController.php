<?php

namespace App\Http\Controllers;

use App\Models\Connection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class IMEIController extends Controller
{
    /**
     * Get IMEI connection details.
     */
    public function getConnection()
    {
        $connection = Connection::where('type', 'IMEI')->first();

        if ($connection) {
            return response()->json([
                'connected' => $connection->connected,
                'api_key' => $connection->connected ? $connection->api_key : null,
            ]);
        }

        return response()->json(['connected' => false, 'api_key' => null]);
    }

    /**
     * Handle IMEI connection.
     */
    public function connect(Request $request)
    {
        $request->validate(['api_key' => 'required|string|max:255']);

        try {
            // Test connection to IMEI API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $request->api_key,
                'Content-Type' => 'application/json',
            ])->get('https://dash.imei.info/api/account/account', [
                'API_KEY' => $request->api_key,
            ]);

            if ($response->successful()) {
                // Save API key and connection status to the database
                Connection::updateOrCreate(
                    ['type' => 'IMEI'],
                    [
                        'api_key' => $request->api_key,
                        'connected' => true,
                    ]
                );

                return response()->json(['connected' => true, 'message' => 'Connected to IMEI'], 200);
            }

            return response()->json([
                'connected' => false,
                'message' => 'Failed to connect to IMEI. Response: ' . $response->body(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json(['connected' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Test IMEI connection.
     */
    public function test(Request $request)
    {
        try {
            $connection = Connection::where('type', 'IMEI')->first();

            $apiKey = $connection && $connection->connected
                ? $connection->api_key
                : $request->validate(['api_key' => 'required|string|max:255'])['api_key'];

            // Test connection to IMEI API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->get('https://dash.imei.info/api/account/account', [
                'API_KEY' => $apiKey,
            ]);

            if ($response->successful()) {
                return response()->json(['connected' => true, 'message' => 'Connection test successful'], 200);
            }

            return response()->json([
                'connected' => false,
                'message' => 'Connection test failed. Response: ' . $response->body(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json(['connected' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Disconnect IMEI.
     */
    public function disconnect()
    {
        try {
            $connection = Connection::where('type', 'IMEI')->first();
            if ($connection) {
                $connection->update([
                    'api_key' => null,
                    'connected' => false,
                ]);
            }

            return response()->json(['message' => 'Disconnected from IMEI'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get account information linked to the API key.
     */
    public function getAccountInfo(Request $request)
    {
        try {
            $connection = Connection::where('type', 'IMEI')->first();

            $apiKey = $connection && $connection->connected
                ? $connection->api_key
                : $request->validate(['api_key' => 'required|string|max:255'])['api_key'];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->get('https://dash.imei.info/api/account/account', [
                'API_KEY' => $apiKey,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'username' => $data['username'] ?? 'Unknown',
                    'email' => $data['email'] ?? 'Unknown',
                    'balance' => $data['balance'] ?? 0.0,
                    'is_active' => $data['is_active'] ?? false,
                    'pricing_level' => $data['pricing_level'] ?? 'Unknown',
                ], 200);
            }

            return response()->json(['message' => 'Failed to fetch account info.'], 400);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}