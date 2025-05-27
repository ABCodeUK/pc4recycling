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
        
        $quoteStatuses = ['Quote Requested', 'Quote Provided', 'Quote Rejected'];
        $collectionStatuses = ['Needs Scheduling', 'Request Pending', 'Scheduled', 'Postponed','Collected'];
        $processingStatuses = ['Received at Facility', 'Processing'];
        $completedStatuses = ['Completed'];
        
        $path = $request->path();
        $isQuotesRoute = str_contains($path, 'quotes');
        $isCollectionsRoute = str_contains($path, 'collections');
        $isProcessingRoute = str_contains($path, 'processing');
        $isCompletedRoute = str_contains($path, 'completed');

        if (in_array($job->job_status, $quoteStatuses) && !$isQuotesRoute) {
            return redirect("/quotes/{$jobId}");
        }

        if (in_array($job->job_status, $collectionStatuses) && !$isCollectionsRoute) {
            return redirect("/collections/{$jobId}");
        }
        
        if (in_array($job->job_status, $processingStatuses) && !$isProcessingRoute) {
            return redirect("/processing/{$jobId}");
        }

        if (in_array($job->job_status, $completedStatuses) &&!$isCompletedRoute) {
            return redirect("/completed/{$jobId}");
        }

        return $next($request);
    }
}

class ClientJobStatusRedirect
{
    
}