<?php

namespace App\Http\Controllers;

use App\Models\UserClient;
use App\Models\UserAddress;
use Illuminate\Http\Request;

class ClientAddressController extends Controller
{
    /**
     * Fetch all useraddresses for a specific parent category.
     */
    public function index($parent_id)
    {
        $useraddresses = UserAddress::where('parent_id', $parent_id)->get();
        return response()->json($useraddresses);
    }

    /**
     * Store a new userAddress.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'address' => 'required|string|max:255',
            'town_city' => 'required|string|max:255',
            'county' => 'required|string|max:255',
            'postcode' => 'required|string|max:255',
            'parent_id' => 'required|exists:users,id',
        ]);

        $userAddress = UserAddress::create($validated);
        return response()->json($userAddress, 201);
    }

    /**
     * Update an existing userAddress.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'address' => 'required|string|max:255',
            'town_city' => 'required|string|max:255',
            'county' => 'required|string|max:255',
            'postcode' => 'required|string|max:255',
        ]);

        $userAddress = UserAddress::findOrFail($id);
        $userAddress->update($validated);
        return response()->json($userAddress);
    }

    /**
     * Delete a userAddress.
     */
    public function destroy($id)
    {
        $userAddress = UserAddress::findOrFail($id);
        $userAddress->delete();
        return response()->json(['message' => 'userAddress deleted successfully.']);
    }
}

