<?php

namespace App\Http\Controllers;

use App\Models\Connection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatGPTController extends Controller
{
    /**
     * Get ChatGPT connection details.
     */
    public function getConnection()
    {
        $connection = Connection::where('type', 'chatgpt')->first();

        if ($connection) {
            return response()->json([
                'connected' => $connection->connected,
                'api_key' => $connection->connected ? $connection->api_key : null,
            ]);
        }

        return response()->json(['connected' => false, 'api_key' => null]);
    }

    /**
     * Handle ChatGPT connection.
     */
    public function connect(Request $request)
    {
        $request->validate(['api_key' => 'required|string|max:255']);

        try {
            // Test connection to ChatGPT API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $request->api_key,
                'Content-Type' => 'application/json',
            ])->get('https://api.openai.com/v1/models');

            if ($response->successful()) {
                // Save API key and connection status to database
                Connection::updateOrCreate(
                    ['type' => 'chatgpt'],
                    [
                        'api_key' => $request->api_key,
                        'connected' => true,
                    ]
                );

                return response()->json(['connected' => true, 'message' => 'Connected to ChatGPT'], 200);
            }

            return response()->json([
                'connected' => false,
                'message' => 'Failed to connect to ChatGPT. Response: ' . $response->body(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json(['connected' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Test ChatGPT connection.
     */
    public function test(Request $request)
    {
        try {
            $connection = Connection::where('type', 'chatgpt')->first();

            if ($connection && $connection->connected) {
                $apiKey = $connection->api_key;
            } else {
                $request->validate(['api_key' => 'required|string|max:255']);
                $apiKey = $request->api_key;
            }

            // Test connection to ChatGPT API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->get('https://api.openai.com/v1/models');

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
     * Disconnect ChatGPT.
     */
    public function disconnect()
    {
        try {
            $connection = Connection::where('type', 'chatgpt')->first();
            if ($connection) {
                $connection->update([
                    'api_key' => null,
                    'connected' => false,
                ]);
            }

            return response()->json(['message' => 'Disconnected from ChatGPT'], 200);
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
            $connection = Connection::where('type', 'chatgpt')->first();

            if ($connection && $connection->connected) {
                $apiKey = $connection->api_key;
            } else {
                $request->validate(['api_key' => 'required|string|max:255']);
                $apiKey = $request->api_key;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->get('https://api.openai.com/v1/organizations');

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'username' => $data['data'][0]['name'] ?? 'Unknown',
                    'email' => $data['data'][0]['email'] ?? 'Unknown',
                ], 200);
            }

            return response()->json(['message' => 'Failed to fetch account info.'], 400);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}