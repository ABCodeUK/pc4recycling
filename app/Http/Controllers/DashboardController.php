<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function getMetrics()
    {
        try {
            $now = Carbon::now();
            $startOfYear = Carbon::now()->startOfYear();
            $thirtyDaysAgo = Carbon::now()->subDays(30);
    
            $metrics = [
                'jobsThisYear' => Job::whereYear('created_at', $now->year)->count(),
                'jobsLast30Days' => Job::where('created_at', '>=', $thirtyDaysAgo)->count(),
                'upcomingCollections' => Job::whereIn('job_status', ['Needs Scheduling', 'Scheduled'])
                    ->where('collection_date', '>=', $now)
                    ->count(),
                'completedJobsThisYear' => Job::where('job_status', 'Complete')
                    ->whereYear('created_at', $now->year)
                    ->count(),
                'recentJobs' => Job::with('client')
                    ->whereIn('job_status', ['Needs Scheduling', 'Scheduled'])
                    ->where('collection_date', '>=', $now)
                    ->orderBy('collection_date')
                    ->limit(10)
                    ->get()
            ];
    
            return response()->json($metrics);
        } catch (\Exception $e) {
            \Log::error('Dashboard metrics error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch metrics'], 500);
        }
    }
    
    public function getUpcomingJobs()
    {
        try {
            $now = Carbon::now();
            $thirtyDaysFromNow = Carbon::now()->addDays(30);
            
            $jobs = Job::with('client')
                ->whereIn('job_status', ['Needs Scheduling', 'Scheduled'])
                ->whereBetween('collection_date', [$now, $thirtyDaysFromNow])
                ->orderBy('collection_date')
                ->get()
                ->map(function ($job) {
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
                        'items_count' => 0,
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
}