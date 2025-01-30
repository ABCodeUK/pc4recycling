<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ClientSubController extends Controller
{
    public function index($parent_id)
    {
        try {
            $subClients = User::where('parent_id', $parent_id)
                ->where('type', 'SubClient')
                ->get(['id', 'name', 'email', 'landline', 'mobile', 'active']);

            return response()->json($subClients);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch sub-clients'], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'landline' => 'nullable|string|max:255',
            'mobile' => 'nullable|string|max:255',
            'parent_id' => 'required|exists:users,id',
        ]);
    
        try {
            // Generate a random password
            $password = \Str::random(12);
    
            $subClient = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => \Hash::make($password),
                'landline' => $validated['landline'],
                'mobile' => $validated['mobile'],
                'parent_id' => $validated['parent_id'],
                'type' => 'SubClient',
                'active' => true,
            ]);
    
            // Send password reset email to the new sub-client
            \Password::sendResetLink(['email' => $subClient->email]);
    
            return response()->json($subClient, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create sub-client'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $subClient = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($id)],
            'landline' => 'nullable|string|max:255',
            'mobile' => 'nullable|string|max:255',
        ]);

        try {
            $subClient->update($validated);
            return response()->json($subClient);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update sub-client'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $subClient = User::findOrFail($id);
            $subClient->delete();
            return response()->json(['message' => 'Sub-client deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete sub-client'], 500);
        }
    }
}