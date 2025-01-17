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
            ->with('staffDetails.role') // Include staff details and role
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'mobile' => $user->mobile,
                    'role' => $user->staffDetails->role->name ?? null, // Get the role name or null
                    'active' => $user->active, // Include the active status

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

        // Redirect to client edit if user type is 'Client'
        if ($user->type === 'Client') {
            return redirect()->route('client.edit', ['id' => $user->id]);
        }

        // Fetch all available roles
        $roles = StaffRole::all(['id', 'name']);

        // Handle staff types normally
        return Inertia::render('Settings/StaffAccounts/StaffAccountsEdit', [
            'user_edit' => $user->only(['id', 'name', 'email', 'mobile', 'type', 'position', 'active']),
            'roles' => $roles, // Pass roles to the view
            'user_edit.role_id' => $user->staffDetails->role_id ?? null, // Pass the role_id directly
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
        // Validate the request data, including the active field
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'mobile' => 'nullable|string',
            'active' => 'required|boolean',
            'role_id' => 'required|exists:users_roles,id',
        ]);
    
        $user = User::findOrFail($id);
    
        // Update the user with the validated data
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'mobile' => $validated['mobile'],
            'active' => $validated['active'],
        ]);
    
        // Update role in the users_staff table
        if ($user->type === 'Staff') {
            $user->staffDetails()->updateOrCreate(
                ['user_id' => $user->id],
                ['role_id' => $validated['role_id']]
            );
        }
    
        return response()->json($user);
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