<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ClientDashboardJobsController extends Controller
{
    /**
     * Fetch all jobs for the currently logged-in client.
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            // Log user info for debugging
            Log::info('Client dashboard jobs request', [
                'user_id' => $user->id,
                'user_type' => $user->type,
                'user_name' => $user->name
            ]);
            
            // Get ALL jobs for the client without filtering by status
            $jobs = Job::where('client_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Log job count for debugging
            Log::info('Client jobs found', [
                'count' => $jobs->count()
            ]);
            
            $formattedJobs = $jobs->map(function ($job) {
                // Count items with "added" = "Collection"
                $itemsCount = JobItem::where('job_id', $job->id)
                    ->where('added', 'Collection')
                    ->count();
                
                return [
                    'id' => $job->id,
                    'job_id' => $job->job_id,
                    'address' => $job->address ?? '',
                    'town_city' => $job->town_city ?? '',
                    'postcode' => $job->postcode ?? '',
                    'created_at' => $job->created_at,
                    'collection_date' => $job->collection_date,
                    'job_status' => $job->job_status,
                    'items_count' => $itemsCount,
                ];
            });
            
            return response()->json($formattedJobs);
        } catch (\Exception $e) {
            Log::error('Client dashboard jobs error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to fetch client jobs: ' . $e->getMessage()], 500);
        }
    }
}