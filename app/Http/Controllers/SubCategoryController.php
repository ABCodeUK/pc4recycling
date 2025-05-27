<?php

namespace App\Http\Controllers;

use App\Models\CategorySub;
use Illuminate\Http\Request;

class SubCategoryController extends Controller
{
    /**
     * Fetch all subcategories for a specific parent category.
     */
    public function index($parent_id)
    {
        $subCategories = CategorySub::where('parent_id', $parent_id)
            ->get()
            ->map(function ($subCategory) {
                return [
                    'id' => $subCategory->id,
                    'name' => $subCategory->name,
                    'default_weight' => $subCategory->default_weight,
                    'parent_id' => $subCategory->parent_id
                ];
            });
        return response()->json($subCategories);
    }

    /**
     * Store a new subcategory.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'default_weight' => 'required|numeric',
            'parent_id' => 'required|exists:categories,id',
        ]);

        $subCategory = CategorySub::create($validated);
        return response()->json($subCategory, 201);
    }

    /**
     * Update an existing subcategory.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'default_weight' => 'required|numeric',
        ]);

        $subCategory = CategorySub::findOrFail($id);
        $subCategory->update($validated);
        return response()->json($subCategory);
    }

    /**
     * Delete a subcategory.
     */
    public function destroy($id)
    {
        $subCategory = CategorySub::findOrFail($id);
        $subCategory->delete();
        return response()->json(['message' => 'SubCategory deleted successfully.']);
    }
}