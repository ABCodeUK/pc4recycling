<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobItem;
use App\Models\VariableCollectionType;
use App\Models\VariableDataSanitisation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientJobController extends Controller
{
    /**
     * Fetch all jobs for a specific client with pagination and filtering.
     */
    public function index(Request $request, $client_id = null)
    {
        // If no client_id is provided, use the authenticated user's ID (for client area)
        $clientId = $client_id ?? Auth::user()->id;
        
        $query = Job::where('client_id', $clientId)
            ->orderBy('created_at', 'desc');

        $jobs = $query->get()
            ->map(function ($job) {
                $itemsCount = JobItem::where('job_id', $job->id)
                    ->whereIn('added', ['Collection', 'Processing'])
                    ->sum('quantity');
                
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
                    'items_count' => $itemsCount,
                    'client' => [
                        'company_name' => $job->client->company_name ?? '',
                    ],
                ];
            });

        // If this is an API request, return JSON
        if ($request->expectsJson()) {
            return response()->json(['jobs' => $jobs]);
        }

        // Otherwise, return the Inertia view (for client area)
        return Inertia::render('ClientArea/Jobs/ClientJobs', [
            'jobs' => $jobs,
            'collection_types' => VariableCollectionType::select('id', 'colt_name')->get(),
            'sanitisation_options' => VariableDataSanitisation::select('id', 'ds_name')->get(),
            'status_options' => Job::$statuses
        ]);
    }

    /**
     * Search jobs for the currently logged-in client.
     */
    public function search(Request $request)
    {
        $user = Auth::user();
        $searchTerm = $request->input('search');

        $jobs = Job::where('client_id', $user->id)
            ->where(function ($query) use ($searchTerm) {
                $query->where('job_id', 'like', "%{$searchTerm}%")
                    ->orWhere('address', 'like', "%{$searchTerm}%")
                    ->orWhere('town_city', 'like', "%{$searchTerm}%")
                    ->orWhere('postcode', 'like', "%{$searchTerm}%");
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($job) {
                // Count items with "added" = "Collection" or "Processing"
                $itemsCount = JobItem::where('job_id', $job->id)
                    ->whereIn('added', ['Collection', 'Processing'])
                    ->sum('quantity');
                
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
                    'items_count' => $itemsCount,
                ];
            });

        return response()->json($jobs);
    }

    /**
     * Display the specified job.
     */
    public function show($id)
    {
        $job = Job::with(['client', 'documents', 'items' => function ($query) {
            $query->whereIn('added', ['Collection', 'Processing'])
                ->orderBy('created_at', 'desc');
        }])->findOrFail($id);

        // Ensure the user can only view their own jobs
        if (Auth::user()->id !== $job->client_id) {
            abort(403, 'Unauthorized action.');
        }

        // Format documents to match frontend expectations
        $formattedDocuments = [
            'collection_manifest' => $job->documents->where('type', 'collection_manifest')->first(),
            'hazard_waste_note' => $job->documents->where('type', 'hazard_waste_note')->first(),
            'data_destruction_certificate' => $job->documents->where('type', 'data_destruction_certificate')->first(),
            'other' => $job->documents->whereNotIn('type', ['collection_manifest', 'hazard_waste_note', 'data_destruction_certificate'])->all()
        ];

        return Inertia::render('ClientArea/Jobs/ClientJobsView', [
            'job' => $job,
            'documents' => $formattedDocuments,
            'collection_types' => VariableCollectionType::select('id', 'colt_name')->get(),
            'sanitisation_options' => VariableDataSanitisation::select('id', 'ds_name')->get(),
            'status_options' => Job::$statuses,
            'customers' => [$job->client] // Only include the current client
        ]);
    }
}