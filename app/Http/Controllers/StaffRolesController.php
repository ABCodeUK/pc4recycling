<?php

namespace App\Http\Controllers;

use App\Models\StaffRole;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffRolesController extends Controller
{
    /**
     * Display a listing of the roles.
     */
    public function index(Request $request)
    {
        // Fetch all Roles with a count of users assigned
        $roles = StaffRole::withCount('users')->get();
    
        // Format roles for frontend
        $formattedRoles = $roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'userCount' => $role->users_count, // Map the user count
            ];
        });
    
        // Check if the request expects a JSON response
        if ($request->expectsJson()) {
            return response()->json($formattedRoles);
        }
    
        // Pass data to the Inertia template for the web view
        return Inertia::render('Settings/StaffAccounts/StaffRoles/StaffRoles', [
            'roles' => $formattedRoles,
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'name' => 'required|unique:users_roles,name|max:255',
        ]);

        // Create the new Role
        $role = StaffRole::create([
            'name' => $request->input('name'),
        ]);

        // Return the newly created Role as JSON
        return response()->json($role);
    }

    /**
     * Update an existing role in storage.
     */
    public function update(Request $request, $id)
    {
        // Validate the request
        $request->validate([
            'name' => "required|unique:users_roles,name,{$id}|max:255",
        ]);

        // Find the existing Role
        $role = StaffRole::findOrFail($id);

        // Update the Role
        $role->update([
            'name' => $request->input('name'),
        ]);

        // Return the updated Role as JSON
        return response()->json($role);
    }

    /**
     * Delete a role from storage.
     */
    public function destroy($id)
    {
        $role = StaffRole::findOrFail($id);

        // Prevent deletion if the role is assigned to any staff
        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a role that is assigned to staff.',
            ], 400);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully.']);
    }
}