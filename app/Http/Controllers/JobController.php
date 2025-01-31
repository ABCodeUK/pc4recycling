<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use App\Models\UserAddress;  // Add this import
use App\Models\JobDocument;  // Add this at the top with other imports
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $status = match ($request->path()) {
            'collections' => ['Needs Scheduling', 'Request Pending', 'Scheduled', 'Postponed'],
            'processing' => ['Collected', 'Processing'],
            'completed' => ['Complete', 'Canceled'],
            default => ['Needs Scheduling', 'Request Pending', 'Scheduled', 'Postponed'],
        };
    
        $jobs = Job::with('client')
            ->whereIn('job_status', $status)
            ->orderBy('created_at', 'desc')
            ->paginate(10);
    
        $customers = User::where('type', 'client')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
    
        return Inertia::render('Jobs/' . ucfirst($request->path()) . '/' . ucfirst($request->path()), [
            'jobs' => $jobs->items(),
            'customers' => $customers,
            'pagination' => [
                'total' => $jobs->total(),
                'currentPage' => $jobs->currentPage(),
                'perPage' => $jobs->perPage(),
            ],
            'collection_types' => Job::$collectionTypes,
            'sanitisation_options' => Job::$sanitisationOptions,
            'status_options' => Job::$statuses  // Add this line
        ]);
    }

    // Add this new method
    public function getNextJobId()
    {
        $nextJobId = Job::generateJobId();
        return response()->json(['next_job_id' => $nextJobId]);
    }

    public function create()
    {
        $clients = User::where('type', 'client')->get();

        return Inertia::render('Jobs/Create', [
            'clients' => $clients,
            'collection_types' => Job::$collectionTypes,
            'sanitisation_options' => Job::$sanitisationOptions,
            'status_options' => Job::$statuses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:users,id',
            'collection_date' => 'required|date',
            'job_status' => 'required|in:' . implode(',', Job::$statuses),
        ]);
    
        // Set default values for required database fields
        $validated['job_id'] = $request->job_id ?? Job::generateJobId();
        $validated['address'] = 'TBC';      // Temporary placeholder
        $validated['town_city'] = 'TBC';    // Temporary placeholder
        $validated['postcode'] = 'TBC';     // Temporary placeholder
        $validated['collection_type'] = Job::$collectionTypes[0];  // Default to first type
        $validated['data_sanitisation'] = Job::$sanitisationOptions[0];  // Default to first option
    
        $job = Job::create($validated);
    
        return response()->json($job);
    }

    public function edit($id)
    {
        $job = Job::with('client')->findOrFail($id);
        
        // Get customers
        // In the edit method, update the customers mapping
        $customers = User::where('type', 'client')
            ->with('clientDetails')
            ->select('id', 'name', 'email', 'mobile', 'landline') // Add landline here
            ->orderBy('name')
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'company_name' => $customer->name,
                    'email' => $customer->email,
                    'mobile' => $customer->mobile,
                    'landline' => $customer->landline, // Get landline from user
                    'address' => $customer->clientDetails->address ?? '',
                    'town_city' => $customer->clientDetails->town_city ?? '',
                    'county' => $customer->clientDetails->county ?? '',
                    'postcode' => $customer->clientDetails->postcode ?? '',
                    'contact_name' => $customer->clientDetails->contact_name ?? '',
                    'position' => $customer->clientDetails->contact_position ?? '', // Changed from position to contact_position
                    'account_status' => 'Active'
                ];
            });
    
        // Get staff members
        $staff = User::where('type', 'Staff')
            ->where('active', true)
            ->with('staffDetails.role')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                ];
            });
    
        return Inertia::render('Jobs/Collections/CollectionsEdit', [
            'job' => $job,
            'customers' => $customers,
            'addresses' => UserAddress::where('parent_id', $job->client_id)->get(),
            'collection_types' => Job::$collectionTypes,
            'sanitisation_options' => Job::$sanitisationOptions,
            'status_options' => Job::$statuses,
            'staff_members' => $staff
        ]);
    }

    public function update(Request $request, $id)
    {
        $job = Job::findOrFail($id);
    
        $validated = $request->validate([
            'job_id' => 'required|string',
            'client_id' => 'required|exists:users,id',
            'job_status' => 'required|in:' . implode(',', Job::$statuses),
            // Make all other fields optional
            'collection_date' => 'nullable|date',
            'staff_collecting' => 'nullable|string',
            'vehicle' => 'nullable|string',
            'address' => 'nullable|string',
            'town_city' => 'nullable|string',
            'postcode' => 'nullable|string',
            'onsite_contact' => 'nullable|string',
            'onsite_number' => 'nullable|string',
            'onsite_email' => 'nullable|email',
            'collection_type' => 'nullable|in:' . implode(',', Job::$collectionTypes),
            'data_sanitisation' => 'nullable|in:' . implode(',', Job::$sanitisationOptions),
            'sla' => 'nullable|string',
            'instructions' => 'nullable|string',
        ]);
    
        $job->update($validated);
    
        return response()->json($job);
    }

    public function destroy($id)
    {
        $job = Job::findOrFail($id);

        if (!$job->isEditable()) {
            return redirect()->back()->with('error', 'This job cannot be deleted');
        }

        $job->delete();
        return redirect()->back()->with('success', 'Job deleted successfully');
    }

    public function show($id)
    {
        $job = Job::with('client')->findOrFail($id);
        
        // Get customers with details
        $customers = User::where('type', 'client')
            ->with('clientDetails')
            ->select('id', 'name', 'email', 'mobile', 'landline')
            ->orderBy('name')
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'company_name' => $customer->name,
                    'email' => $customer->email,
                    'mobile' => $customer->mobile,
                    'landline' => $customer->landline,
                    'address' => $customer->clientDetails->address ?? '',
                    'town_city' => $customer->clientDetails->town_city ?? '',
                    'county' => $customer->clientDetails->county ?? '',
                    'postcode' => $customer->clientDetails->postcode ?? '',
                    'contact_name' => $customer->clientDetails->contact_name ?? '',
                    'position' => $customer->clientDetails->contact_position ?? '',
                    'account_status' => 'Active'
                ];
            });
    
        // Get documents for this job
        $documents = JobDocument::where('job_id', $id)
            ->get()
            ->groupBy('document_type')
            ->map(function ($docs, $type) {
                return $type === 'other' ? $docs : $docs->first();
            });
    
        return Inertia::render('Jobs/Collections/CollectionsView', [
            'job' => $job,
            'customers' => $customers,
            'documents' => [
                'collection_manifest' => $documents['collection_manifest'] ?? null,
                'hazard_waste_note' => $documents['hazard_waste_note'] ?? null,
                'data_destruction_certificate' => $documents['data_destruction_certificate'] ?? null,
                'other' => $documents['other'] ?? [],
            ],
        ]);
    }
}