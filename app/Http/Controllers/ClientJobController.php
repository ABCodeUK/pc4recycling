<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;

class ClientJobController extends Controller
{
    /**
     * Fetch all jobs for a specific client.
     */
    public function index($client_id)
    {
        $jobs = Job::where('client_id', $client_id)
            ->orderBy('created_at', 'desc')
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
                    'items_count' => 0, // You can implement this later if needed
                ];
            });

        return response()->json($jobs);
    }
}