<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserClient;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PrivacyPolicyController extends Controller
{
    public function accept(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user || $user->type !== 'Client') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Get or create client details
            $clientDetails = $user->clientDetails;
            if (!$clientDetails) {
                $clientDetails = new UserClient();
                $clientDetails->user_id = $user->id;
            }
            
            // Update the privacy policy fields
            $clientDetails->privacy_policy = 'Accepted';
            $clientDetails->privacy_policy_date = Carbon::now();
            
            // Save the changes
            $clientDetails->save();

            return response()->json([
                'success' => true,
                'message' => 'Privacy policy accepted'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Privacy Policy Accept Error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to save privacy policy acceptance'
            ], 500);
        }
    }
}