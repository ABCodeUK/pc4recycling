<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ClientAccountsController extends Controller
{
    public function index()
    {
        $clients = User::where('type', 'Client')->get(); // Fetch client accounts
        $currentUserId = auth()->id(); // Get logged-in user's ID

        return Inertia::render('ClientAccounts/ClientAccounts', [
            'clients' => $clients,
            'currentUserId' => $currentUserId,
        ]);
    }

    public function edit($id)
    {
        $user = User::findOrFail($id);

        // Redirect to staff edit if user type is 'Staff'
        if ($user->type === 'Staff') {
            return redirect()->route('client.index', ['id' => $user->id]);
        }

        // Handle client types normally
        return Inertia::render('ClientAccounts/ClientAccountsEdit', [
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

        $validated['type'] = 'Client';
        $validated['active'] = true;
        $validated['password'] = bcrypt('defaultPassword'); // Add a default password

        $user = User::create($validated);

        // Return the user data as JSON
        return response()->json($user);
    }
}