<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index()
    {
        $jobs = Job::select('id', 'job_id', 'collection_date', 'client_id', 'job_status')
            ->whereNotNull('collection_date')
            ->with('client:id,name')
            ->orderBy('job_id')
            ->get()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'job_id' => $job->job_id,
                    'job_status' => $job->job_status,
                    'client_name' => $job->client->name,
                    'collection_date' => $job->collection_date,
                    'url' => "/collections/{$job->id}"
                ];
            });

        return Inertia::render('Calendar/Calendar', [
            'jobs' => $jobs
        ]);
    }
}
