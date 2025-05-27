<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Add this import

class DashboardController extends Controller
{
    public function getMetrics()
    {
        try {
            $now = Carbon::now();
            $startOfYear = Carbon::now()->startOfYear();
            $user = Auth::user();
            
            $metrics = [
                // Jobs with collection dates in current year
                'jobsThisYear' => Job::whereYear('collection_date', $now->year)
                    ->count(),
                
                // Jobs with collection dates in current month
                'jobsLast30Days' => Job::whereYear('collection_date', $now->year)
                    ->whereMonth('collection_date', $now->month)
                    ->count(),
                
                // Only scheduled jobs
                'upcomingCollections' => Job::where('job_status', 'Scheduled')
                    ->where('collection_date', '>=', $now)
                    ->count(),
                
                // Completed jobs with collection dates in current year
                'completedJobsThisYear' => Job::where('job_status', 'Complete')
                    ->whereYear('collection_date', $now->year)
                    ->count(),
                
                'recentJobs' => Job::with('client')
                    ->where('job_status', 'Scheduled')
                    ->where('collection_date', '>=', $now)
                    ->orderBy('collection_date')
                    ->limit(10)
                    ->get()
            ];
    
            // Add client-specific metrics if the user is a client
            if ($user && $user->client) {
                $metrics['clientMetrics'] = [
                    'lifetimeItemsRecycled' => \App\Models\JobItem::whereHas('job', function ($query) use ($user) {
                        $query->where('client_id', $user->client->id);
                    })->count(),
                    
                    'carbonSavings' => 0, // Placeholder for now
                    
                    'jobsThisYear' => Job::where('client_id', $user->client->id)
                        ->whereYear('collection_date', $now->year)
                        ->count(),
                        
                    'jobsLastYear' => Job::where('client_id', $user->client->id)
                        ->whereYear('collection_date', $now->year - 1)
                        ->count(),
                ];
            }
    
            return response()->json($metrics);
        } catch (\Exception $e) {
            \Log::error('Dashboard metrics error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch metrics'], 500);
        }
    }
    
    public function getUpcomingJobs()
    {
        try {
            $now = Carbon::now()->startOfDay();
            $fourteenDaysFromNow = Carbon::now()->addDays(14)->endOfDay();
            
            $jobs = Job::with('client')
                ->whereIn('job_status', ['Needs Scheduling', 'Scheduled'])
                ->whereBetween('collection_date', [$now, $fourteenDaysFromNow])
                ->orderBy('collection_date')
                ->get()
                ->map(function ($job) {
                    // Count items with "added" = "Collection"
                    $itemsCount = \App\Models\JobItem::where('job_id', $job->id)
                        ->where('added', 'Collection')
                        ->count();
                    
                    return [
                        'id' => $job->id,
                        'job_id' => $job->job_id,
                        'address' => $job->address,
                        'town_city' => $job->town_city,
                        'postcode' => $job->postcode,
                        'created_at' => $job->created_at,
                        'collection_date' => $job->collection_date,
                        'staff_collecting' => $job->staff_collecting,
                        'job_status' => $job->job_status,
                        'items_count' => $itemsCount, // Use the actual count instead of 0
                        'client' => [
                            'name' => $job->client->name ?? 'Unknown Client'
                        ]
                    ];
                });
    
            return response()->json($jobs);
        } catch (\Exception $e) {
            \Log::error('Upcoming jobs error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch upcoming jobs'], 500);
        }
    }
    
    /**
     * Get jobs assigned to the currently logged-in driver
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDriverJobs(Request $request)
    {
        try {
            $now = Carbon::now()->startOfDay();
            $thirtyDaysFromNow = Carbon::now()->addDays(30)->endOfDay();
            $user = $request->user();
            
            $jobs = Job::with('client')
                ->where('staff_collecting', $user->name)
                ->whereIn('job_status', ['Scheduled', 'Needs Scheduling'])
                ->whereBetween('collection_date', [$now, $thirtyDaysFromNow])
                ->orderBy('collection_date')
                ->get()
                ->map(function ($job) {
                    // Count items with "added" = "Collection"
                    $itemsCount = \App\Models\JobItem::where('job_id', $job->id)
                        ->where('added', 'Collection')
                        ->count();
                    
                    return [
                        'id' => $job->id,
                        'job_id' => $job->job_id,
                        'address' => $job->address,
                        'town_city' => $job->town_city,
                        'postcode' => $job->postcode,
                        'created_at' => $job->created_at,
                        'collection_date' => $job->collection_date,
                        'staff_collecting' => $job->staff_collecting,
                        'job_status' => $job->job_status,
                        'items_count' => $itemsCount, // Use the actual count instead of 0
                        'client' => [
                            'name' => $job->client->name ?? 'Unknown Client'
                        ]
                    ];
                });
    
            return response()->json($jobs);
        } catch (\Exception $e) {
            \Log::error('Driver jobs error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch driver jobs'], 500);
        }
    }
   
}