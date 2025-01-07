<?php

namespace App\Http\Controllers;

use App\Models\VariableManufacturer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VariableManufacturerController extends Controller
{
    /**
     * Display a listing of the Manufacturers.
     */
    public function index()
    {
        // Fetch all Manufacturers and append full URL for the logo
        $manufacturers = VariableManufacturer::all()->map(function ($manufacturer) {
            $manufacturer->manufacturer_logo = $manufacturer->manufacturer_logo
                ? asset('storage/' . $manufacturer->manufacturer_logo)
                : null; // Placeholder if no logo
            return $manufacturer;
        });

        // Pass data to the Inertia template
        return Inertia::render('Settings/Variables/Manufacturers/Manufacturers', [
            'manufacturers' => $manufacturers,
        ]);
    }

    /**
     * Store a newly created Manufacturer in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $validated = $request->validate([
            'manufacturer_name' => 'required|unique:variable_manufacturers,manufacturer_name|max:255',
            'manufacturer_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'manufacturer_url' => 'nullable|url|max:255', // Made optional
        ]);

        // Handle file upload
        if ($request->hasFile('manufacturer_logo')) {
            $path = $request->file('manufacturer_logo')->store('manufacturer_logos', 'public');
            $validated['manufacturer_logo'] = $path;
        }

        // Create the new Manufacturer
        $manufacturer = VariableManufacturer::create($validated);

        // Append the full URL for the logo in the response
        $manufacturer->manufacturer_logo = $manufacturer->manufacturer_logo
            ? asset('storage/' . $manufacturer->manufacturer_logo)
            : null;

        // Return the newly created Manufacturer as JSON
        return response()->json($manufacturer);
    }

    /**
     * Update an existing Manufacturer in storage.
     */
    public function update(Request $request, $id)
    {
        // Find the existing Manufacturer
        $manufacturer = VariableManufacturer::findOrFail($id);

        // Validate the request
        $validated = $request->validate([
            'manufacturer_name' => "required|unique:variable_manufacturers,manufacturer_name,{$id}|max:255",
            'manufacturer_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'manufacturer_url' => 'nullable|url|max:255', // Made optional
        ]);

        // Handle file upload
        if ($request->hasFile('manufacturer_logo')) {
            // Delete the old logo if it exists
            if ($manufacturer->manufacturer_logo) {
                Storage::disk('public')->delete($manufacturer->manufacturer_logo);
            }

            $path = $request->file('manufacturer_logo')->store('manufacturer_logos', 'public');
            $validated['manufacturer_logo'] = $path;
        }

        // Handle logo removal
        if ($request->input('remove_logo') === 'true') {
            if ($manufacturer->manufacturer_logo) {
                Storage::disk('public')->delete($manufacturer->manufacturer_logo);
            }
            $validated['manufacturer_logo'] = null;
        }

        // Update the Manufacturer
        $manufacturer->update($validated);

        // Append the full URL for the logo in the response
        $manufacturer->manufacturer_logo = $manufacturer->manufacturer_logo
            ? asset('storage/' . $manufacturer->manufacturer_logo)
            : null;

        // Return the updated Manufacturer as JSON
        return response()->json($manufacturer);
    }

    /**
     * Delete a Manufacturer from storage.
     */
    public function destroy($id)
    {
        $manufacturer = VariableManufacturer::findOrFail($id);

        // Delete the logo file if it exists
        if ($manufacturer->manufacturer_logo) {
            Storage::disk('public')->delete($manufacturer->manufacturer_logo);
        }

        $manufacturer->delete();

        // Return success message as JSON
        return response()->json(['message' => 'Manufacturer deleted successfully.']);
    }
}
