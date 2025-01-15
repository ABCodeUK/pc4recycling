<?php

namespace App\Http\Controllers;

use App\Models\VariableCustomerType;
use Inertia\Inertia;
use Illuminate\Http\Request;

class VariableCustomerTypeController extends Controller
{
    /**
     * Display a listing of the customer types.
     */
    public function index()
    {
        // Fetch all Customer Types
        $customerTypes = VariableCustomerType::all();

        // Pass data to the Inertia template
        return Inertia::render('Settings/Variables/CustomerTypes/CustomerTypes', [
            'customerTypes' => $customerTypes,
        ]);
    }

    /**
     * Store a newly created Customer Type in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'ct_name' => 'required|unique:variable_customer_types,ct_name|max:255',
        ]);

        // Create the new Customer Type
        $customerType = VariableCustomerType::create([
            'ct_name' => $request->input('ct_name'),
        ]);

        // Return the newly created Customer Type as JSON
        return response()->json($customerType);
    }

    /**
     * Update an existing Customer Type in storage.
     */
    public function update(Request $request, $id)
    {
        // Validate the request
        $request->validate([
            'ct_name' => "required|unique:variable_customer_types,ct_name,{$id}|max:255",
        ]);

        // Find the existing Customer Type
        $customerType = VariableCustomerType::findOrFail($id);

        // Update the Customer Type
        $customerType->update([
            'ct_name' => $request->input('ct_name'),
        ]);

        // Return the updated Customer Type as JSON
        return response()->json($customerType);
    }

    /**
     * Delete a Customer Type from storage.
     */
    public function destroy($id)
    {
        $customerType = VariableCustomerType::findOrFail($id);
        $customerType->delete();

        // Return success message as JSON
        return response()->json(['message' => 'Customer Type deleted successfully.']);
    }
}