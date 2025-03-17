<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\JobDocument;
use App\Models\JobItem; // Add this import
use App\Services\JobAuditService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\VariableCollectionType;
use App\Models\VariableDataSanitisation;
use App\Services\PDFService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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
            ->get()
            ->map(function ($job) {
                // Count items with "added" = "Collection"
                $itemsCount = JobItem::where('job_id', $job->id)
                    ->where('added', 'Collection')
                    ->count();
                
                return [
                    'id' => $job->id,
                    'job_id' => $job->job_id,
                    'client_id' => $job->client_id,
                    'collection_date' => $job->collection_date,
                    'job_status' => $job->job_status,
                    'staff_collecting' => $job->staff_collecting,
                    'vehicle' => $job->vehicle,
                    'address' => $job->address,
                    'address_2' => $job->address_2,
                    'town_city' => $job->town_city,
                    'postcode' => $job->postcode,
                    'onsite_contact' => $job->onsite_contact,
                    'onsite_number' => $job->onsite_number,
                    'onsite_email' => $job->onsite_email,
                    'collection_type' => $job->collection_type,
                    'data_sanitisation' => $job->data_sanitisation,
                    'sla' => $job->sla,
                    'instructions' => $job->instructions,
                    'equipment_location' => $job->equipment_location,
                    'building_access' => $job->building_access,
                    'collection_route' => $job->collection_route,
                    'parking_loading' => $job->parking_loading,
                    'equipment_readiness' => $job->equipment_readiness,
                    'created_at' => $job->created_at,
                    'updated_at' => $job->updated_at,
                    'items_count' => $itemsCount,
                    'client' => $job->client,
                ];
            });
    
        return Inertia::render('Jobs/' . ucfirst($request->path()) . '/' . ucfirst($request->path()), [
            'jobs' => $jobs,
            'customers' => User::where('type', 'client')
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),
            'collection_types' => VariableCollectionType::select('id', 'colt_name')->get(),
            'sanitisation_options' => VariableDataSanitisation::select('id', 'ds_name')->get(),
            'status_options' => Job::$statuses
        ]);
    }

    public function edit($id)
    {
        $job = Job::with(['client', 'collectionType', 'dataSanitisation'])->findOrFail($id);
        $jobArray = $job->toArray();
        
        // Format the collection_type and data_sanitisation IDs for the frontend selects
        if ($job->collectionType) {
            $jobArray['collection_type'] = $job->collectionType->id;
        }
        
        if ($job->dataSanitisation) {
            $jobArray['data_sanitisation'] = $job->dataSanitisation->id;
        }
        
        // Get customers
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
                    'address_2' => $customer->clientDetails->address_2 ?? '',
                    'town_city' => $customer->clientDetails->town_city ?? '',
                    'county' => $customer->clientDetails->county ?? '',
                    'postcode' => $customer->clientDetails->postcode ?? '',
                    'contact_name' => $customer->clientDetails->contact_name ?? '',
                    'position' => $customer->clientDetails->contact_position ?? '',
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
    
        // Get sub-clients for the current client
        $subClients = User::where('parent_id', $job->client_id)
            ->where('type', 'SubClient')
            ->get()
            ->map(function ($subClient) {
                return [
                    'id' => $subClient->id,
                    'name' => $subClient->name,
                    'email' => $subClient->email,
                    'mobile' => $subClient->mobile,
                    'landline' => $subClient->landline,
                ];
            });

        return Inertia::render('Jobs/Collections/CollectionsEdit', [
            'job' => $jobArray,
            'customers' => $customers,
            'addresses' => UserAddress::where('parent_id', $job->client_id)->get(),
            'collection_types' => VariableCollectionType::select('id', 'colt_name')->get(),
            'sanitisation_options' => VariableDataSanitisation::select('id', 'ds_name')->get(),
            'status_options' => Job::$statuses,
            'staff_members' => $staff,
            'sub_clients' => $subClients  // Add this line
        ]);
    }

    public function show($id)
    {
        $job = Job::with(['client', 'collectionType', 'dataSanitisation'])->findOrFail($id);
        $jobArray = $job->toArray();
        
        // Handle collection type
        if ($job->collectionType) {
            $jobArray['collection_type'] = $job->collectionType->colt_name;
        }
        
        // Handle data sanitisation
        if ($job->dataSanitisation) {
            $jobArray['data_sanitisation'] = $job->dataSanitisation->ds_name;
        }
        
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
                    'address_2' => $customer->clientDetails->address_2 ?? '',
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
            'job' => $jobArray,
            'customers' => $customers,
            'documents' => [
                'collection_manifest' => $documents['collection_manifest'] ?? null,
                'hazard_waste_note' => $documents['hazard_waste_note'] ?? null,
                'data_destruction_certificate' => $documents['data_destruction_certificate'] ?? null,
                'other' => $documents['other'] ?? [],
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $job = Job::findOrFail($id);
            
            $validated = $request->validate([
                'job_id' => 'required|string',
                'client_id' => 'required|exists:users,id',
                'collection_date' => 'nullable|date',
                'job_status' => 'required|string',
                'staff_collecting' => 'nullable|string',
                'vehicle' => 'nullable|string',
                'address' => 'nullable|string',
                'address_2' => 'nullable|string',
                'town_city' => 'nullable|string',
                'postcode' => 'nullable|string',
                'onsite_contact' => 'nullable|string',
                'onsite_number' => 'nullable|string',
                'onsite_email' => 'nullable|email',
                'collection_type' => 'nullable|exists:variable_collection_types,id',
                'data_sanitisation' => 'nullable|exists:variable_data_sanitisation,id',
                'sla' => 'nullable|string',
                'instructions' => 'nullable|string',
                'equipment_location' => 'nullable|string',
                'building_access' => 'nullable|string',
                'collection_route' => 'nullable|string',
                'parking_loading' => 'nullable|string',
                'equipment_readiness' => 'nullable|string',
            ]);
    
            $job->update($validated);
            
            return response()->json($job);
        } catch (\Exception $e) {
            \Log::error('Job update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update job'], 500);
        }
    }
    public function getNextJobId()
    {
        try {
            $nextJobId = Job::generateJobId();
            return response()->json(['next_job_id' => $nextJobId]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to generate job ID'], 500);
        }
    }
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'job_id' => 'required|string|unique:clients_jobs,job_id',
                'client_id' => 'required|exists:users,id',
                'collection_date' => 'nullable|date',
                'job_status' => 'required|string',
                'staff_collecting' => 'nullable|string',
                'vehicle' => 'nullable|string',
                'address' => 'nullable|string',
                'address_2' => 'nullable|string',
                'town_city' => 'nullable|string',
                'postcode' => 'nullable|string',
                'onsite_contact' => 'nullable|string',
                'onsite_number' => 'nullable|string',
                'onsite_email' => 'nullable|email',
                'collection_type' => 'nullable|exists:variable_collection_types,id',
                'data_sanitisation' => 'nullable|exists:variable_data_sanitisation,id',
                'sla' => 'nullable|string',
                'instructions' => 'nullable|string',
                'equipment_location' => 'nullable|string',
                'building_access' => 'nullable|string',
                'collection_route' => 'nullable|string',
                'parking_loading' => 'nullable|string',
                'equipment_readiness' => 'nullable|string',
            ]);
    
            $job = Job::create($validated);
            
            // Add audit log for job creation
            JobAuditService::log($job->id, 'job_created', 'true');
            
            return response()->json($job, 201);
        } catch (\Exception $e) {
            \Log::error('Job creation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create job', 'message' => $e->getMessage()], 500);
        }
    }
    public function destroy($id)
    {
        try {
            $job = Job::findOrFail($id);
            $job->delete();
            
            return redirect()->route('collections.index')->with('success', 'Job deleted successfully');
        } catch (\Exception $e) {
            \Log::error('Job deletion error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete job');
        }
    }
    public function markAsCollected(Request $request, $jobId)
    {
        try {
            Log::info('Starting markAsCollected', ['job_id' => $jobId]);
            
            $job = Job::where('job_id', $jobId)
                ->with(['client', 'items.category'])
                ->firstOrFail();
    
            // Validate signatures
            $request->validate([
                'customer_signature' => 'required|string',
                'driver_signature' => 'required|string',
                'customer_name' => 'required|string'
            ]);
    
            // Create job folder if it doesn't exist
            $jobFolder = "jobs/{$job->job_id}";
            if (!Storage::disk('public')->exists($jobFolder)) {
                Storage::disk('public')->makeDirectory($jobFolder);
            }
    
            // Save customer signature
            $customerSignatureData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $request->customer_signature));
            $customerFilename = "customer-signature-{$job->job_id}.png";
            Storage::disk('public')->put("{$jobFolder}/{$customerFilename}", $customerSignatureData);
    
            // Create customer signature document record
            JobDocument::create([
                'job_id' => $job->id,
                'document_type' => 'customer_signature',
                'original_filename' => $customerFilename,
                'stored_filename' => $customerFilename,
                'file_path' => "{$jobFolder}/{$customerFilename}",
                'mime_type' => 'image/png',
                'file_size' => strlen($customerSignatureData)
            ]);
    
            // Save driver signature
            $driverSignatureData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $request->driver_signature));
            $driverFilename = "driver-signature-{$job->job_id}.png";
            Storage::disk('public')->put("{$jobFolder}/{$driverFilename}", $driverSignatureData);
    
            // Create driver signature document record
            JobDocument::create([
                'job_id' => $job->id,
                'document_type' => 'driver_signature',
                'original_filename' => $driverFilename,
                'stored_filename' => $driverFilename,
                'file_path' => "{$jobFolder}/{$driverFilename}",
                'mime_type' => 'image/png',
                'file_size' => strlen($driverSignatureData)
            ]);
    
            // Generate collection manifest if it doesn't exist
            $existingManifest = $job->documents()
                ->where('document_type', 'collection_manifest')
                ->first();
    
            if (!$existingManifest) {
                // Generate PDF
                $pdfService = new PDFService();
                $pdf = $pdfService->generateCollectionManifest($job);
    
                // Save PDF file
                $filename = "{$job->job_id}-Collection-Manifest.pdf";
                $path = "{$jobFolder}/{$filename}";
                Storage::disk('public')->put($path, $pdf->output());
    
                // Create document record
                $document = JobDocument::create([
                    'job_id' => $job->id,
                    'document_type' => 'collection_manifest',
                    'original_filename' => $filename,
                    'stored_filename' => $filename,
                    'file_path' => $path,
                    'mime_type' => 'application/pdf',
                    'file_size' => Storage::disk('public')->size($path)
                ]);
            }
    
            // Update job status and customer name
            $job->update([
                'job_status' => 'Collected',
                'customer_signature_name' => $request->customer_name
            ]);
    
            // Add audit log entry as system note
            JobAuditService::log($job->id, 'Job collected and signatures obtained', 'true', 'Job collected and signatures obtained');

            return response()->json([
                'message' => 'Job marked as collected successfully',
                'document' => $existingManifest ?? $document ?? null
            ]);
    
        } catch (\Exception $e) {
            Log::error('Failed to mark job as collected', [
                'job_id' => $jobId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to mark job as collected: ' . $e->getMessage()], 500);
        }
    }
}
