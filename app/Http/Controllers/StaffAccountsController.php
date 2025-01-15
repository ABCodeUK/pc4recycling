<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class StaffAccountsController extends Controller
{
    public function index()
    {
        $staff = User::where('type', 'Staff')->get(); // Fetch staff accounts
        $currentUserId = auth()->id(); // Get logged-in user's ID

        return Inertia::render('Settings/StaffAccounts/StaffAccounts', [
            'staff' => $staff,
            'currentUserId' => $currentUserId,
        ]);
    }

    public function edit($id)
    {
        $user = User::findOrFail($id);

        // Redirect to customer edit if user type is 'Client'
        if ($user->type === 'Client') {
            return redirect()->route('customers.edit', ['id' => $user->id]);
        }

        // Handle staff types normally
        return Inertia::render('Settings/StaffAccounts/StaffAccountsEdit', [
            'user_edit' => $user->only(['id', 'name', 'email', 'landline', 'mobile', 'type', 'position', 'active']),
        ]);
    }

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

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'landline' => 'nullable|string',
            'mobile' => 'nullable|string',
        ]);

        $user = User::findOrFail($id);
        $user->update($validated);
        return response()->json($user);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
        ]);

        $validated['type'] = 'Staff';
        $validated['active'] = true;
        $validated['password'] = bcrypt('defaultPassword'); // Add a default password

        $user = User::create($validated);

        // Return the user data as JSON
        return response()->json($user);
    }
}