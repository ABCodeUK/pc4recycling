<?php

namespace App\Http\Controllers;

use App\Models\Connection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatGPTController extends Controller
{
    /**
     * Handle ChatGPT connection.
     */
    public function connect(Request $request)
    {
        $request->validate(['api_key' => 'required|string|max:255']);

        try {
            // Test connection to ChatGPT
            $response = Http::withToken($request->api_key)
                ->post('https://api.openai.com/v1/models');

            if ($response->successful()) {
                // Save API key and connection status to database
                Connection::updateOrCreate(
                    ['type' => 'chatgpt'], // Match by type
                    [
                        'api_key' => $request->api_key,
                        'connected' => true, // Update the connected status
                        'host' => null, // Ensure other fields remain null
                        'port' => null,
                        'username' => null,
                        'password' => null,
                        'database' => null,
                    ]
                );

                return response()->json(['connected' => true, 'message' => 'Connected to ChatGPT'], 200);
            }

            return response()->json(['connected' => false, 'message' => 'Failed to connect to ChatGPT'], 400);
        } catch (\Exception $e) {
            return response()->json(['connected' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Test ChatGPT connection without saving to database.
     */
    public function test(Request $request)
    {
        $request->validate(['api_key' => 'required|string|max:255']);

        try {
            // Send test request to ChatGPT
            $response = Http::withToken($request->api_key)
                ->post('https://api.openai.com/v1/models');

            if ($response->successful()) {
                return response()->json(['connected' => true, 'message' => 'Connection test successful'], 200);
            }

            return response()->json(['connected' => false, 'message' => 'Connection test failed'], 400);
        } catch (\Exception $e) {
            return response()->json(['connected' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
