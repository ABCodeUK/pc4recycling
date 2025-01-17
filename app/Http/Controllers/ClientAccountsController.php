<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserClient;
use App\Models\VariableCustomerType;
use App\Models\VariableIndustry;
use App\Models\VariableLeadSource;
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
            ->with(['clientDetails.customerType', 'clientDetails.industry', 'clientDetails.leadSource']) // Include relationships
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
                    'town_city' => $user->clientDetails->town_city ?? null,
                    'county' => $user->clientDetails->county ?? null,
                    'postcode' => $user->clientDetails->postcode ?? null,
                    'contact_position' => $user->clientDetails->contact_position ?? null,
                    'industry' => $user->clientDetails->industry->in_name ?? null,
                    'customer_type' => $user->clientDetails->customerType->ct_name ?? null,
                    'lead_source' => $user->clientDetails->leadSource->ls_name ?? null,
                    'active' => $user->active,
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
            'user_edit' => $user->only(['id', 'name', 'email', 'landline', 'mobile', 'type', 'position', 'active']),
            'client_details' => $user->clientDetails ? $user->clientDetails->only([
                'industry_id', 'lead_source_id', 'customer_type_id', 'address', 'town_city', 'county', 'postcode',
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
            'active' => 'required|boolean',
            'industry_id' => 'nullable|exists:variable_industries,id',
            'lead_source_id' => 'nullable|exists:variable_lead_sources,id',
            'customer_type_id' => 'nullable|exists:variable_customer_types,id',
            'address' => 'nullable|string|max:255',
            'town_city' => 'nullable|string|max:255',
            'county' => 'nullable|string|max:255',
            'postcode' => 'nullable|string|max:20',
            'contact_name' => 'nullable|string|max:255',
            'contact_position' => 'nullable|string|max:255',
            'sic_code' => 'nullable|string|max:255',
            'customer_notes' => 'nullable|string',
        ]);

        $user = User::findOrFail($id);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'landline' => $validated['landline'],
            'mobile' => $validated['mobile'],
            'active' => $validated['active'],
        ]);

        $user->clientDetails()->updateOrCreate(
            ['user_id' => $user->id],
            $request->only([
                'industry_id', 'lead_source_id', 'customer_type_id', 'address', 'town_city', 'county', 'postcode',
                'contact_name', 'contact_position', 'sic_code', 'customer_notes',
            ])
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
            'email' => 'required|email|unique:users,email',
            'landline' => 'nullable|string|max:255',
            'mobile' => 'nullable|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'industry_id' => 'nullable|exists:variable_industries,id',
            'lead_source_id' => 'nullable|exists:variable_lead_sources,id',
            'customer_type_id' => 'nullable|exists:variable_customer_types,id',
        ]);

        $validated['type'] = 'Client';
        $validated['active'] = true;
        $validated['password'] = bcrypt('defaultPassword');

        $user = User::create($validated);

        $user->clientDetails()->create($request->only([
            'industry_id', 'lead_source_id', 'customer_type_id', 'address', 'town_city', 'county', 'postcode',
            'contact_name', 'contact_position', 'sic_code', 'customer_notes',
        ]));

        return response()->json($user);
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
}