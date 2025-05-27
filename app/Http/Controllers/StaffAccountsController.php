<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\StaffRole; // Include the StaffRole model
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class StaffAccountsController extends Controller
{
    /**
     * Display a listing of the staff accounts.
     */
    public function index()
    {
        $staff = User::where('type', 'Staff')
            ->with('staffDetails.role')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'mobile' => $user->mobile,
                    'role' => $user->staffDetails->role->name ?? null,
                    'active' => $user->active,
                    'driver_type' => $user->driver_type, // Add this line
                ];
            });
    
        $currentUserId = auth()->id();
    
        return Inertia::render('Settings/StaffAccounts/StaffAccounts', [
            'staff' => $staff,
            'currentUserId' => $currentUserId,
        ]);
    }

    /**
     * Show the form for editing the specified staff account.
     */
    public function edit($id)
    {
        $user = User::findOrFail($id);

        if ($user->type === 'Client') {
            return redirect()->route('client.edit', ['id' => $user->id]);
        }

        $roles = StaffRole::all(['id', 'name']);

        return Inertia::render('Settings/StaffAccounts/StaffAccountsEdit', [
            'user_edit' => array_merge($user->only([
                'id', 'name', 'email', 'mobile', 'type', 
                'position', 'active', 'driver_type', 'carrier_registration', 'external_vehicle_registration'
            ]), [
                'role_id' => $user->staffDetails->role_id ?? null,
            ]),
            'roles' => $roles,
        ]);
    }

    

    /**
     * Remove the specified staff account from storage.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent deletion of the currently authenticated user
        if ($user->id === auth()->id()) {
            return response()->json(['error' => 'You cannot delete yourself'], 403);
        }

        $user->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Update the specified staff account in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'mobile' => 'nullable|string',
            'active' => 'required|boolean',
            'role_id' => 'required|exists:users_roles,id',
            'driver_type' => 'nullable|string|in:internal,external',
            'carrier_registration' => 'nullable|string',
            'external_vehicle_registration' => 'nullable|string',
        ]);
    
        $user = User::findOrFail($id);
        
        // Get the role name
        $role = StaffRole::find($validated['role_id']);
        $isDriver = $role && $role->name === 'Drivers';
        
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'mobile' => $validated['mobile'],
            'active' => $validated['active'],
            'driver_type' => $isDriver ? $validated['driver_type'] : null,
            'carrier_registration' => ($isDriver && $validated['driver_type'] === 'external') ? $validated['carrier_registration'] : null,
            'external_vehicle_registration' => ($isDriver && $validated['driver_type'] === 'external') ? $validated['external_vehicle_registration'] : null,
        ]);
    
        if ($user->type === 'Staff') {
            $user->staffDetails()->updateOrCreate(
                ['user_id' => $user->id],
                ['role_id' => $validated['role_id']]
            );
        }
    
        return response()->json(['message' => 'Staff account updated successfully']);
    }

    /**
     * Store a newly created staff account in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role_id' => 'required|exists:users_roles,id', // Validate role_id
        ]);

        $validated['type'] = 'Staff';
        $validated['active'] = true;
        $validated['password'] = bcrypt('defaultPassword'); // Add a default password

        $user = User::create($validated);

        // Assign role in the users_staff table
        $user->staffDetails()->create(['role_id' => $validated['role_id']]);

        // Return the user data as JSON
        return response()->json($user);
    }

    /**
 * Reset the password for the specified staff account.
 */
public function resetPassword(Request $request, $id)
{
    // Validate the incoming request
    $validated = $request->validate([
        'password' => 'required|string|min:8|confirmed', // Includes password confirmation
    ]);

    $user = User::findOrFail($id);

    // Update the user's password
    $user->update([
        'password' => bcrypt($validated['password']),
    ]);

    return response()->json(['message' => 'Password reset successfully.']);
}

public function sendResetEmail($id)
{
    $user = User::findOrFail($id);

    try {
        // Trigger password reset email
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