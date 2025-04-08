<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Job;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JobStatusRedirect
{
    public function handle(Request $request, Closure $next): Response
    {
        $jobId = $request->route('id');
        $job = Job::findOrFail($jobId);
        
        $collectionStatuses = ['Needs Scheduling', 'Request Pending', 'Scheduled', 'Postponed'];
        $processingStatuses = ['Collected', 'Received at Facility', 'Processing'];
        
        $path = $request->path();
        $isCollectionsRoute = str_contains($path, 'collections');
        $isProcessingRoute = str_contains($path, 'processing');

        if (in_array($job->job_status, $collectionStatuses) && !$isCollectionsRoute) {
            return redirect("/collections/{$jobId}");
        }
        
        if (in_array($job->job_status, $processingStatuses) && !$isProcessingRoute) {
            return redirect("/processing/{$jobId}");
        }

        return $next($request);
    }
}