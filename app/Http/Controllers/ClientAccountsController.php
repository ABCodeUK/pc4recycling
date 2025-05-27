<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserClient;
use App\Models\UserAddress;
use App\Models\VariableCustomerType;
use App\Models\VariableIndustry;
use App\Models\VariableLeadSource;
use App\Models\Job;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class ClientAccountsController extends Controller
{
    /**
     * Display a listing of the client accounts.
     */
    public function index()
    {
        $clients = User::where('type', 'Client')
            ->with(['clientDetails.customerType', 'clientDetails.industry', 'clientDetails.leadSource'])
            ->withCount('jobs') // Add this line to count related jobs
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'mobile' => $user->mobile,
                    'landline' => $user->landline,
                    'contact_name' => $user->clientDetails->contact_name ?? null,
                    'address' => $user->clientDetails->address ?? null,
                    'address_2' => $user->clientDetails->address ?? null,
                    'town_city' => $user->clientDetails->town_city ?? null,
                    'county' => $user->clientDetails->county ?? null,
                    'postcode' => $user->clientDetails->postcode ?? null,
                    'contact_position' => $user->clientDetails->contact_position ?? null,
                    'industry' => $user->clientDetails->industry->in_name ?? null,
                    'customer_type' => $user->clientDetails->customerType->ct_name ?? null,
                    'lead_source' => $user->clientDetails->leadSource->ls_name ?? null,
                    'active' => $user->active,
                    'jobs_count' => $user->jobs_count, // Add this line to include the count
                ];
            });
    
        $currentUserId = auth()->id();
    
        return Inertia::render('ClientAccounts/ClientAccounts', [
            'clients' => $clients,
            'currentUserId' => $currentUserId,
        ]);
    }

    /**
     * Show the form for editing the specified client account.
     */
    public function edit($id)
    {
        $user = User::findOrFail($id);

        if ($user->type !== 'Client') {
            return redirect()->route('client.index');
        }

        return Inertia::render('ClientAccounts/ClientAccountsEdit', [
            'user_edit' => $user->only(['id', 'name', 'email', 'landline', 'mobile', 'type', 'position', 'active', 'contract']),
            'client_details' => $user->clientDetails ? $user->clientDetails->only([
                'industry_id', 'lead_source_id', 'customer_type_id', 'address','address_2', 'town_city', 'county', 'postcode',
                'contact_name', 'contact_position', 'sic_code', 'customer_notes',
            ]) : [],
            'industries' => VariableIndustry::all(['id', 'in_name']),
            'lead_sources' => VariableLeadSource::all(['id', 'ls_name']),
            'customer_types' => VariableCustomerType::all(['id', 'ct_name']),
        ]);
    }

    /**
     * Display the specified client account.
     */
    public function view($id)
    {
        $user = User::findOrFail($id);
    
        if ($user->type !== 'Client') {
            return redirect()->route('client.index');
        }
    
        return Inertia::render('ClientAccounts/ClientAccountsView', [
            'user_edit' => $user->only(['id', 'name', 'email', 'landline', 'mobile', 'type', 'position', 'active']),
            'client_details' => $user->clientDetails ? $user->clientDetails->only([
                'industry_id', 'lead_source_id', 'customer_type_id', 'address','address_2', 'town_city', 'county', 'postcode',
                'contact_name', 'contact_position', 'sic_code', 'customer_notes',
            ]) : [],
            'industries' => VariableIndustry::all(['id', 'in_name']),
            'lead_sources' => VariableLeadSource::all(['id', 'ls_name']),
            'customer_types' => VariableCustomerType::all(['id', 'ct_name']),
        ]);
    }

    /**
     * Update the specified client account in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'landline' => 'nullable|string|max:255',
            'mobile' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'contract' => 'nullable|string|max:255',
            'active' => 'required|boolean',
            'type' => 'required|string',
            'industry_id' => 'nullable|exists:variable_industries,id',
            'lead_source_id' => 'nullable|exists:variable_lead_sources,id',
            'customer_type_id' => 'nullable|exists:variable_customer_types,id',
            'address' => 'nullable|string|max:255',
            'address_2' => 'nullable|string|max:255',
            'town_city' => 'nullable|string|max:255',
            'county' => 'nullable|string|max:255',
            'postcode' => 'nullable|string|max:20',
            'contact_name' => 'nullable|string|max:255',
            'sic_code' => 'nullable|string|max:255',
            'customer_notes' => 'nullable|string',
        ]);
    
        $user = User::findOrFail($id);
    
        // Update user fields
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'landline' => $validated['landline'],
            'mobile' => $validated['mobile'],
            'contract' => $validated['contract'], // Add this line
            'active' => $validated['active'],
            'type' => $validated['type'],
        ]);
    
        // Update or create client details
        $clientData = array_intersect_key($validated, array_flip([
            'industry_id',
            'lead_source_id',
            'customer_type_id',
            'address',
            'address_2',
            'town_city',
            'county',
            'postcode',
            'contact_name',
            'sic_code',
            'customer_notes',
        ]));

        // Add position to client details as contact_position
        $clientData['contact_position'] = $validated['position'] ?? null;
    
        $user->clientDetails()->updateOrCreate(
            ['user_id' => $user->id],
            $clientData
        );
    
        return response()->json(['message' => 'Client updated successfully.']);
    }

    /**
     * Store a newly created client account in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'contact_name' => 'nullable|string|max:255',
            'password' => 'required|string|min:8',
        ]);
    
        try {
            // Create the user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
                'type' => 'Client',
                'active' => true,
            ]);
    
            // Create the client details
            $user->clientDetails()->create([
                'contact_name' => $validated['contact_name'],
            ]);
    
            return response()->json($user->load('clientDetails'));
    
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create client account.'], 500);
        }
    }

    /**
     * Reset the password for the specified client account.
     */
    public function resetPassword(Request $request, $id)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::findOrFail($id);
        $user->update(['password' => bcrypt($validated['password'])]);

        return response()->json(['message' => 'Password reset successfully.']);
    }

    /**
     * Send a password reset email.
     */
    public function sendResetEmail($id)
    {
        $user = User::findOrFail($id);

        try {
            $status = Password::sendResetLink(['email' => $user->email]);

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json(['message' => __($status)], 200);
            }

            return response()->json(['error' => __($status)], 400);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getClientDetails($id)
    {
        try {
            $clientDetails = UserClient::where('user_id', $id)->firstOrFail();
            return response()->json($clientDetails, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Client details not found.'], 404);
        }
    }

    /**
 * Get the default address for a specific user.
 */
public function getDefaultAddress($id)
{
    $userClient = UserClient::where('user_id', $id)->firstOrFail();

    return response()->json([
        'address' => $userClient->address,
        'address_2' => $userClient->address,
        'town_city' => $userClient->town_city,
        'county' => $userClient->county,
        'postcode' => $userClient->postcode,
    ]);
}
    
// Add this new method
public function getClientJobs($id)
{
    $jobs = Job::where('client_id', $id)
        ->with('client') // Include client relationship if needed
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($job) {
            return [
                'id' => $job->id,
                'job_id' => $job->job_id,
                'address' => $job->address,
                'address_2' => $job->address,
                'town_city' => $job->town_city,
                'postcode' => $job->postcode,
                'created_at' => $job->created_at,
                'collection_date' => $job->collection_date,
                'staff_collecting' => $job->staff_collecting,
                'job_status' => $job->job_status,
                'items_count' => 0, // You'll need to implement this based on your requirements
            ];
        });

    return response()->json($jobs);
}
public function destroy($id)
{
    try {
        $user = User::findOrFail($id);
        
        // Check if user has any jobs
        if ($user->jobs()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete customer with existing jobs. Please delete all jobs first.',
                'hasJobs' => true
            ], 422);
        }
        
        // Delete related records first
        if ($user->clientDetails) {
            $user->clientDetails->delete();
        }
        
        // Delete the user
        $user->delete();
        
        return response()->json(['message' => 'Customer deleted successfully']);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Error deleting customer: ' . $e->getMessage()], 500);
    }
}
    
}