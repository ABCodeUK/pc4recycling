<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\JobDocument;
use App\Models\JobItem;
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
            'quotes' => ['Quote Requested', 'Quote Provided', 'Quote Rejected'],
            'collections' => ['Needs Scheduling', 'Request Pending', 'Scheduled', 'Postponed','Collected'],
            'processing' => ['Received at Facility', 'Processing'],
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
                    ->sum('quantity');
                
                // Count all items (both Collection and Processing)
                $processitemsCount = JobItem::where('job_id', $job->id)
                    ->whereIn('added', ['Collection', 'Processing'])
                    ->sum('quantity');
                
                return [
                    'id' => $job->id,
                    'job_id' => $job->job_id,
                    'job_quote' => $job->job_quote,
                    'client_id' => $job->client_id,
                    'collection_date' => $job->collection_date,
                    'quote_information' => $job->quote_information,
                    'job_status' => $job->job_status,
                    'staff_collecting' => $job->staff_collecting,
                    'vehicle' => $job->vehicle,
                    'driver_carrier_registration' => $job->driver_carrier_registration,  // Add this line
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
                    'process_items_count' => $processitemsCount,
                    'client' => $job->client,
                    'collected_at' => $job->collected_at,
                    'processed_at' => $job->processed_at,
                    'received_at' => $job->received_at,
                    'completed_at' => $job->completed_at,
                    'technician_signature_name' => $job->technician_signature_name,
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
        // In the edit or create method where staff members are loaded
        $staff = User::where('type', 'Staff')
        ->where('active', true)
        ->with('staffDetails.role')
        ->get()
        ->map(function ($user) {
        return [
        'id' => $user->id,
        'name' => $user->name,
        'driver_type' => $user->driver_type,
        'external_vehicle_registration' => $user->external_vehicle_registration,
        'carrier_registration' => $user->carrier_registration,
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

        // Fix the match statement syntax
        $viewPath = match (explode('/', request()->path())[0]) {
            'quotes' => 'Jobs/Quotes/QuotesEdit',
            'processing' => 'Jobs/Processing/ProcessingEdit',
            'completed' => 'Jobs/Completed/CompletedEdit',
            default => 'Jobs/Collections/CollectionsEdit'
        };

        return Inertia::render($viewPath, [
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
        
        if ($job->collectionType) {
            $jobArray['collection_type'] = $job->collectionType->colt_name;
        }
        if ($job->dataSanitisation) {
            $jobArray['data_sanitisation'] = $job->dataSanitisation->ds_name;
        }
    
        // Get customers with proper select and map functions
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
    
        // Get documents with proper grouping and mapping
        $documents = JobDocument::where('job_id', $id)
            ->get()
            ->groupBy('document_type')
            ->map(function ($docs, $type) {
                return $type === 'other' ? $docs : $docs->first();
            });
    
        $viewPath = match (explode('/', request()->path())[0]) {
            'quotes' => 'Jobs/Quotes/QuotesView',
            'processing' => 'Jobs/Processing/ProcessingView',
            'completed' => 'Jobs/Completed/CompletedView',
            default => 'Jobs/Collections/CollectionsView'
        };
    
        return Inertia::render($viewPath, [
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
                'job_quote' => 'nullable|string',
                'client_id' => 'required|exists:users,id',
                'collection_date' => 'nullable|date',
                'quote_information' => 'nullable|string',
                'job_status' => 'required|string',
                'staff_collecting' => 'nullable|string',
                'vehicle' => 'nullable|string',
                'driver_carrier_registration' => 'nullable|string',
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
                'job_quote' => 'nullable|string',
                'collection_date' => 'nullable|date',
                'quote_information' => 'nullable|string',
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
            JobAuditService::log($job->id, 'Job Created', 'true');
            
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

            // Reset any existing warehouse/staff signatures
            $job->update([
                'staff_signature_name' => null,
                'received_at' => null
            ]);

            // Copy item details to processing fields
            foreach ($job->items as $item) {
                $item->update([
                    'processing_make' => $item->make,
                    'processing_model' => $item->model,
                    'processing_serial_number' => $item->serial_number,
                    'processing_asset_tag' => $item->asset_tag,
                    'processing_weight' => $item->weight,
                    'processing_specification' => $item->specification,
                    'processing_erasure_required' => $item->erasure_required,
                    'collected' => 'YES'
                ]);
            }

            // Validate signatures and names
            $request->validate([
                'customer_signature' => 'required|string',
                'customer_name' => 'required|string',
                'driver_signature' => 'required|string',
                'driver_name' => 'required|string',
                'vehicle' => 'required|string'
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
    
            // Create or update customer signature document record
            JobDocument::updateOrCreate(
                [
                    'job_id' => $job->id,
                    'document_type' => 'customer_signature'
                ],
                [
                    'original_filename' => $customerFilename,
                    'stored_filename' => $customerFilename,
                    'file_path' => "{$jobFolder}/{$customerFilename}",
                    'mime_type' => 'image/png',
                    'file_size' => strlen($customerSignatureData)
                ]
            );
    
            // Save driver signature
            $driverSignatureData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $request->driver_signature));
            $driverFilename = "driver-signature-{$job->job_id}.png";
            Storage::disk('public')->put("{$jobFolder}/{$driverFilename}", $driverSignatureData);
    
            // Create or update driver signature document record
            JobDocument::updateOrCreate(
                [
                    'job_id' => $job->id,
                    'document_type' => 'driver_signature'
                ],
                [
                    'original_filename' => $driverFilename,
                    'stored_filename' => $driverFilename,
                    'file_path' => "{$jobFolder}/{$driverFilename}",
                    'mime_type' => 'image/png',
                    'file_size' => strlen($driverSignatureData)
                ]
            );
    
            // Update job status and names
            $job->update([
                'job_status' => 'Collected',
                'customer_signature_name' => $request->customer_name,
                'driver_signature_name' => $request->driver_name,
                'vehicle' => $request->vehicle,
                'collected_at' => now()
            ]);
    
            // Refresh the job model with all necessary relationships
            $job = Job::where('job_id', $jobId)
                ->with(['client', 'items.category'])
                ->firstOrFail();
    
            // Generate collection manifest
            $pdfService = new PDFService();
            $pdf = $pdfService->generateCollectionManifest($job);
    
            // Save PDF file
            $filename = "{$job->job_id}-Collection-Manifest.pdf";
            $path = "{$jobFolder}/{$filename}";
            Storage::disk('public')->put($path, $pdf->output());
    
            // Create or update document record
            JobDocument::updateOrCreate(
                [
                    'job_id' => $job->id,
                    'document_type' => 'collection_manifest'
                ],
                [
                    'original_filename' => $filename,
                    'stored_filename' => $filename,
                    'file_path' => $path,
                    'mime_type' => 'application/pdf',
                    'file_size' => Storage::disk('public')->size($path)
                ]
            );

            // Generate hazardous waste note
            $hazardPdf = $pdfService->generateHazardousWasteNote($job);
            
            // Save hazardous waste note PDF
            $hazardFilename = "{$job->job_id}-Hazardous-Waste-Note.pdf";
            $hazardPath = "{$jobFolder}/{$hazardFilename}";
            Storage::disk('public')->put($hazardPath, $hazardPdf->output());
            
            // Create or update hazardous waste note document record
            JobDocument::updateOrCreate(
                [
                    'job_id' => $job->id,
                    'document_type' => 'hazard_waste_note'
                ],
                [
                    'original_filename' => $hazardFilename,
                    'stored_filename' => $hazardFilename,
                    'file_path' => $hazardPath,
                    'mime_type' => 'application/pdf',
                    'file_size' => Storage::disk('public')->size($hazardPath)
                ]
            );

            // Add audit log
            JobAuditService::log($job->id, 'Job collected and signatures obtained', 'true');
    
            return response()->json([
                'message' => 'Job marked as collected successfully',
                'job' => $job
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in markAsCollected', [
                'job_id' => $jobId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to mark job as collected',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function markAsProcessing(Request $request, $jobId)
    {
        try {
            $job = Job::where('job_id', $jobId)
                ->with(['client', 'items.category'])
                ->firstOrFail();
            
            // Update job status and technician name
            $job->update([
                'job_status' => 'Processing',
                'processed_at' => now(),
                'technician_signature_name' => auth()->user()->name
            ]);
            
            // Add audit log
            JobAuditService::log($job->id, 'Job processing started', 'true');
        
            return response()->json([
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error in markAsProcessing', [
                'job_id' => $jobId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to mark job as processing', 'message' => $e->getMessage()], 500);
        }
    }
    public function markAsQuotwRejected(Request $request, $jobId)
    {
        try {
            $job = Job::where('job_id', $jobId)
                ->with(['client', 'items.category'])
                ->firstOrFail();
            
            // Update job status and technician name
            $job->update([
                'job_status' => 'Quote Rejected',

            ]);
            
            // Add audit log
            JobAuditService::log($job->id, 'Quote Rejected', 'true');
        
            return response()->json([
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error in markAsQuoteRejected', [
                'job_id' => $jobId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to mark quote as rejected', 'message' => $e->getMessage()], 500);
        }
    }
public function markAsReceived(Request $request, $jobId)
{
    try {
        Log::info('Starting markAsReceived', [
            'job_id' => $jobId,
            'request_data' => $request->all()
        ]);
        
        $job = Job::where('job_id', $jobId)
            ->with(['client', 'items.category'])  // Include necessary relationships
            ->firstOrFail();

        // Validate request
        $validated = $request->validate([
            'staffSignature' => 'required|string',
            'staffName' => 'required|string',
            'receivedDate' => 'required|date'
        ]);

        // Create job folder if it doesn't exist
        $jobFolder = "jobs/{$job->job_id}";
        if (!Storage::disk('public')->exists($jobFolder)) {
            Storage::disk('public')->makeDirectory($jobFolder);
        }

        // Save staff signature
        $staffSignatureData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $validated['staffSignature']));
        $staffFilename = "staff-signature-{$job->job_id}.png";
        Storage::disk('public')->put("{$jobFolder}/{$staffFilename}", $staffSignatureData);

        // Create staff signature document record
        JobDocument::create([
            'job_id' => $job->id,
            'document_type' => 'staff_signature',
            'original_filename' => $staffFilename,
            'stored_filename' => $staffFilename,
            'file_path' => "{$jobFolder}/{$staffFilename}",
            'mime_type' => 'image/png',
            'file_size' => strlen($staffSignatureData)
        ]);

        // Update job status and staff details
        $job->update([
            'job_status' => 'Received at Facility',
            'staff_signature_name' => $validated['staffName'],
            'received_at' => $validated['receivedDate']
        ]);

        // Refresh the job model with all necessary relationships
        $job = Job::where('job_id', $jobId)
            ->with(['client', 'items.category'])
            ->firstOrFail();

        // Generate new Collection Manifest PDF with updated data
        $pdfService = new PDFService();
        $pdf = $pdfService->generateCollectionManifest($job);

        // Save Collection Manifest PDF file (overwriting existing)
        $filename = "{$job->job_id}-Collection-Manifest.pdf";
        $path = "{$jobFolder}/{$filename}";
        Storage::disk('public')->put($path, $pdf->output());

        // Update existing document record or create new one for Collection Manifest
        $document = JobDocument::updateOrCreate(
            [
                'job_id' => $job->id,
                'document_type' => 'collection_manifest'
            ],
            [
                'original_filename' => $filename,
                'stored_filename' => $filename,
                'file_path' => $path,
                'mime_type' => 'application/pdf',
                'file_size' => Storage::disk('public')->size($path)
            ]
        );

        // Generate Hazardous Waste Note PDF
        $hazardPdf = $pdfService->generateHazardousWasteNote($job);
        
        // Save Hazardous Waste Note PDF file
        $hazardFilename = "{$job->job_id}-Hazard-Waste-Note.pdf";
        $hazardPath = "{$jobFolder}/{$hazardFilename}";
        Storage::disk('public')->put($hazardPath, $hazardPdf->output());
        
        // Create document record for Hazardous Waste Note
        $hazardDocument = JobDocument::create([
            'job_id' => $job->id,
            'document_type' => 'hazard_waste_note',
            'original_filename' => $hazardFilename,
            'stored_filename' => $hazardFilename,
            'file_path' => $hazardPath,
            'mime_type' => 'application/pdf',
            'file_size' => Storage::disk('public')->size($hazardPath)
        ]);

        // Add audit log
        JobAuditService::log($job->id, 'Job received at facility', 'true');

        return response()->json([
            'success' => true,
            'document' => $document,
            'hazardDocument' => $hazardDocument
        ]);

    } catch (\Exception $e) {
        Log::error('Error in markAsReceived', [
            'job_id' => $jobId,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => 'Failed to mark job as received', 'message' => $e->getMessage()], 500);
    }
}
public function provideQuote(Request $request, $jobId)
{
    $request->validate([
        'job_quote' => 'required|numeric',
        'collection_date' => 'required|date',
        'quote_information' => 'nullable|string' // Changed from required to nullable
    ]);

    $job = Job::where('job_id', $jobId)->firstOrFail();
    
    $job->update([
        'job_quote' => $request->job_quote,
        'collection_date' => $request->collection_date,
        'quote_information' => $request->quote_information ?? '', // Use empty string as fallback
        'job_status' => 'Quote Provided'
    ]);

    // Add audit log
    app(JobAuditService::class)->log(
        $job->id,
        auth()->id(),
        "Quote provided for £{$request->job_quote}",
        false
    );

    return response()->json(['message' => 'Quote provided successfully']);
}

// Add this method if it doesn't exist, or update it if it does
public function markCompleted(Request $request, $jobId, PDFService $pdfService)
{
    $job = Job::where('job_id', $jobId)->firstOrFail();
    
    try {
        // Update job status
        $job->update([
            'job_status' => 'Complete',
            'completed_at' => now()
        ]);

        // Generate and save the Data Destruction Certificate
        $certificatePath = $pdfService->generateDataDestructionCertificate($job);

        // Create audit log entry
        app(JobAuditService::class)->log($job->id, 'Job marked as complete', 'true');
        

        return response()->json([
            'success' => true,
            'message' => 'Job marked as complete successfully',
            'certificatePath' => $certificatePath
        ]);

    } catch (\Exception $e) {
        Log::error('Error marking job as complete: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to mark job as complete'
        ], 500);
    }
}
    // Add this method after the existing methods
    
    /**
     * Generate a hazardous waste note PDF for a job
     */
    public function generateHazardousWasteNote($jobId)
    {
        try {
            $job = Job::with(['client', 'items.category'])->findOrFail($jobId);
            
            // Use the PDF service to generate the PDF
            $pdfService = new PDFService();
            $pdf = $pdfService->generateHazardousWasteNote($job);
            
            // Return the PDF for download
            return $pdf->download($job->job_id . '-Hazard-Waste-Note.pdf');
        } catch (\Exception $e) {
            Log::error('Error generating hazardous waste note: ' . $e->getMessage());
            return back()->with('error', 'Failed to generate hazardous waste note');
        }
    }
}

