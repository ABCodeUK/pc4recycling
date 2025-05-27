<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\JobDocument;
use App\Models\JobItem;
use App\Models\VariableCollectionType;
use App\Models\VariableDataSanitisation;
use App\Services\JobAuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // Add this import
use Inertia\Inertia;

class ClientQuoteController extends Controller
{
    /**
     * Fetch all jobs for a specific client with pagination and filtering.
     */
    public function index(Request $request, $client_id = null)
    {
        // If no client_id is provided, use the authenticated user's ID (for client area)
        $clientId = $client_id ?? Auth::user()->id;
        
        $query = Job::where('client_id', $clientId)
            ->whereIn('job_status', ['Quote Draft', 'Quote Requested', 'Quote Provided', 'Quote Rejected'])
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
        return Inertia::render('ClientArea/Quotes/ClientQuotes', [
            'jobs' => $jobs,
            'collection_types' => VariableCollectionType::select('id', 'colt_name')->get(),
            'sanitisation_options' => VariableDataSanitisation::select('id', 'ds_name')->get(),
            'status_options' => Job::$statuses,
            'addresses' => UserAddress::where('parent_id', $clientId)->get(),
            'sub_clients' => User::where('parent_id', $clientId)->get(),
            'customers' => User::with(['clientDetails'])->where('id', $clientId)->get()
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
            ->whereIn('job_status', ['Quote Requested', 'Quote Provided', 'Quote Rejected'])
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
    
        // Get addresses and sub-clients for the client
        $addresses = UserAddress::where('parent_id', $job->client_id)->get();
        $sub_clients = User::where('parent_id', $job->client_id)->get();
    
        return Inertia::render('ClientArea/Quotes/ClientQuotesView', [
            'job' => $job,
            'documents' => $formattedDocuments,
            'collection_types' => VariableCollectionType::select('id', 'colt_name')->get(),
            'sanitisation_options' => VariableDataSanitisation::select('id', 'ds_name')->get(),
            'status_options' => Job::$statuses,
            'customers' => [$job->client], // Only include the current client
            'addresses' => $addresses,
            'sub_clients' => $sub_clients
        ]);
    }

    public function markQuoteRejected($id)
    {
        $job = Job::findOrFail($id);
        
        // Ensure the user can only reject their own quotes
        if (Auth::user()->id !== $job->client_id) {
            abort(403, 'Unauthorized action.');
        }

        // Update job status
        $job->job_status = 'Quote Rejected';
        $job->save();
    
        return response()->json([
            'success' => true
        ]);
    }

    public function markQuoteAccepted($id)
    {
        $job = Job::findOrFail($id);
        
        // Ensure the user can only reject their own quotes
        if (Auth::user()->id !== $job->client_id) {
            abort(403, 'Unauthorized action.');
        }

        // Update job status
        $job->job_status = 'Scheduled';
        $job->save();
    
        // Add audit log
        JobAuditService::log($job->id, 'Job Quote Accepted by customer', 'true');

        return response()->json([
            'success' => true
        ]);
    }
    
    /**
     * Create a new quote draft for the client.
     */
    public function createQuote(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Check if user has required details
            if (!$user || !$user->clientDetails) {
                return response()->json([
                    'success' => false,
                    'message' => 'User profile is incomplete. Please update your profile first.'
                ], 400);
            }
    
            // Get the next job ID using the Job model's method directly
            $jobId = Job::generateJobId();
            
            // Create a new job with Quote Requested status
            $job = new Job();
            $job->job_id = $jobId;
            $job->client_id = $user->id;
            $job->job_status = 'Quote Draft';
            
            // Set default values from client details
            $job->address = $user->clientDetails->address ?? '';
            $job->address_2 = $user->clientDetails->address_2 ?? '';
            $job->town_city = $user->clientDetails->town_city ?? '';
            $job->postcode = $user->clientDetails->postcode ?? '';
            $job->onsite_contact = $user->clientDetails->contact_name ?? $user->name;
            $job->onsite_number = $user->clientDetails->mobile ?? '';
            $job->onsite_email = $user->email ?? '';
            
            $job->save();
    
            // Log the action
            JobAuditService::log($job->id, 'Quote Requested', 'true');
    
            return response()->json([
                'success' => true,
                'redirect' => route('client.quotes.show', $job->id)
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error creating quote: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the quote. Please try again.'
            ], 500);
        }
    }
    public function getNextJobId()
    {
        try {
            $nextJobId = Job::generateJobId();
            return response()->json(['next_job_id' => $nextJobId]);
        } catch (\Exception $e) {
            Log::error('Failed to generate next job ID: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate job ID'], 500);
        }
    }
    public function submitQuoteRequest($id)
    {
        $job = Job::findOrFail($id);
        
        // Ensure the user can only submit their own quotes
        if (Auth::user()->id !== $job->client_id) {
            abort(403, 'Unauthorized action.');
        }
    
        // Update job status
        $job->job_status = 'Quote Requested';
        $job->save();
    
        // Add audit log
        JobAuditService::log($job->id, 'Quote Request submitted by customer', 'true');
    
        return response()->json([
            'success' => true
        ]);
    }
    public function handleDeleteDraft($id)
    {
        $job = Job::findOrFail($id);
        
        // Ensure the user can only delete their own draft quotes
        if (Auth::user()->id !== $job->client_id) {
            abort(403, 'Unauthorized action.');
        }

        if ($job->job_status !== 'Quote Draft') {
            abort(403, 'Only draft quotes can be deleted.');
        }

        $job->delete();
    
        return response()->json([
            'success' => true
        ]);
    }

    /**
     * Update the collection details for a specific job.
     */
    public function updateCollectionDetails(Request $request, $id)
    {
        $job = Job::findOrFail($id);
        
        // Validate that the authenticated user owns this job
        if ($job->client_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Add validation rules
        $validated = $request->validate([
            'address' => 'nullable|string',
            'address_2' => 'nullable|string',
            'town_city' => 'nullable|string',
            'postcode' => 'nullable|string',
            'onsite_contact' => 'nullable|string',
            'onsite_number' => 'nullable|string',
            'onsite_email' => 'nullable|email',
            'instructions' => 'nullable|string',
            'equipment_location' => 'nullable|string',
            'building_access' => 'nullable|string',
            'collection_route' => 'nullable|string',
            'parking_loading' => 'nullable|string',
            'equipment_readiness' => 'nullable|string'

        ]);

        try {
            $job->update($validated);
            
            // Add audit log
            JobAuditService::log($job->id, 'Collection details updated by customer', 'true');
            
            return response()->json([
                'success' => true,
                'job' => $job
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating collection details: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update collection details'], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'job_id' => 'required|string',
            'client_id' => 'required|exists:users,id',
            'collection_date' => 'nullable|date',
            'job_status' => 'required|string',
            'staff_collecting' => 'nullable|string',
            'vehicle' => 'nullable|string',
            'driver_type' => 'nullable|string',
            'driver_carrier_registration' => 'nullable|string',
            'address' => 'required|string',
            'address_2' => 'nullable|string',
            'town_city' => 'required|string',
            'postcode' => 'required|string',
            'onsite_contact' => 'required|string',
            'onsite_number' => 'nullable|string',
            'onsite_email' => 'nullable|email',
            'collection_type' => 'nullable|exists:variable_collection_types,id',
            'data_sanitisation' => 'nullable|exists:variable_data_sanitisations,id',
            'sla' => 'nullable|string',
            'instructions' => 'nullable|string',
            'equipment_location' => 'nullable|string',
            'building_access' => 'nullable|string',
            'collection_route' => 'nullable|string',
            'parking_loading' => 'nullable|string',
            'equipment_readiness' => 'nullable|string'
        ]);

        // Create the job
        $job = Job::create($request->all());

        // Return the response
        return response()->json([
            'message' => 'Quote created successfully',
            'job' => $job
        ], 201);
    }

    public function edit($id)
    {
        $job = Job::findOrFail($id);
        $client = User::with(['addresses', 'subClients'])->findOrFail($job->client_id);
        
        return Inertia::render('ClientArea/Quotes/QuoteEdit', [
            'job' => $job,
            'customers' => User::where('type', 'client')->get(),
            'addresses' => $client->addresses,
            'sub_clients' => $client->subClients,
            'collection_types' => VariableCollectionType::select('id', 'colt_name')->get(),
            'sanitisation_options' => VariableDataSanitisation::select('id', 'ds_name')->get(),
            'status_options' => Job::$statuses,
            'staff_members' => User::where('type', 'staff')
                ->select('id', 'name', 'driver_type', 'carrier_registration', 'external_vehicle_registration')
                ->get()
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'job_id' => 'required|string',
            'client_id' => 'required|exists:users,id',
            'collection_date' => 'nullable|date',
            'job_status' => 'required|string',
            'staff_collecting' => 'nullable|string',
            'vehicle' => 'nullable|string',
            'driver_type' => 'nullable|string',
            'driver_carrier_registration' => 'nullable|string',
            'address' => 'required|string',
            'address_2' => 'nullable|string',
            'town_city' => 'required|string',
            'postcode' => 'required|string',
            'onsite_contact' => 'required|string',
            'onsite_number' => 'nullable|string',
            'onsite_email' => 'nullable|email',
            'collection_type' => 'nullable|exists:variable_collection_types,id',
            'data_sanitisation' => 'nullable|exists:variable_data_sanitisations,id',
            'sla' => 'nullable|string',
            'instructions' => 'nullable|string',
            'equipment_location' => 'nullable|string',
            'building_access' => 'nullable|string',
            'collection_route' => 'nullable|string',
            'parking_loading' => 'nullable|string',
            'equipment_readiness' => 'nullable|string'
        ]);

        $job = Job::findOrFail($id);
        $job->update($request->all());

        return response()->json([
            'message' => 'Quote updated successfully',
            'job' => $job
        ]);
    }
    public function destroy($id)
    {
        $job = Job::findOrFail($id);
        
        // Ensure the user can only delete their own quotes
        if (Auth::user()->id !== $job->client_id) {
            abort(403, 'Unauthorized action.');
        }

        // Delete the job
        $job->delete();
    
        return response()->json([
            'success' => true
        ]);
    }
}