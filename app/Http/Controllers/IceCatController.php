<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Connection;

class IceCatController extends Controller
{
    /**
     * Get IceCat connection details.
     */
    public function getConnection()
    {
        $connection = Connection::where('type', 'icecat')->first();

        if ($connection) {
            return response()->json([
                'connected' => $connection->connected,
                'apiKey' => $connection->api_key,
                'username' => $connection->username,
            ]);
        }

        return response()->json(['connected' => false]);
    }

    /**
     * Test IceCat API connection.
     */
    public function testConnection(Request $request)
    {
        $request->validate([
            'apiKey' => 'required|string',
            'username' => 'required|string',
        ]);

        try {
            // Perform a test request to IceCat
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $request->apiKey,
            ])->get('https://live.icecat.biz/api', [
                'UserName' => $request->username,
                'Language' => 'en',
                'Content' => 'GeneralInfo',
                'Brand' => 'hp', // Replace with valid test brand if needed
                'ProductCode' => 'RJ459AV', // Replace with valid test product code if needed
            ]);

            if ($response->successful()) {
                return true;
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Save IceCat API credentials to the database.
     */
    public function saveConnection(Request $request)
    {
        $request->validate([
            'apiKey' => 'required|string',
            'username' => 'required|string',
        ]);

        try {
            // Test the connection before saving
            if (!$this->testConnection($request)) {
                return response()->json([
                    'message' => 'Failed to connect to IceCat API. Credentials not saved.',
                ], 400);
            }

            // Save credentials securely to database
            Connection::updateOrCreate(
                ['type' => 'icecat'],
                [
                    'api_key' => $request->apiKey,
                    'username' => $request->username,
                    'connected' => true,
                ]
            );

            return response()->json(['message' => 'Credentials saved successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Disconnect IceCat connection.
     */
    public function disconnect()
    {
        try {
            $connection = Connection::where('type', 'icecat')->first();
            if ($connection) {
                $connection->update([
                    'api_key' => null,
                    'username' => null,
                    'connected' => false,
                ]);
            }

            return response()->json(['message' => 'Disconnected from IceCat.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}