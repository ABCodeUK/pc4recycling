<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\VariableEwcCode;
use App\Models\VariableHPCode;
use App\Models\VariableSpecField;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with(['ewcCode', 'hpCodes', 'specFields'])->get();

        // Fetch options from the related variables tables
        $ewcCodes = VariableEwcCode::all(['id', 'ewc_code']);
        $hpCodes = VariableHPCode::all(['id', 'hp_code', 'hp_type']);
        $specFields = VariableSpecField::all(['id', 'spec_name']);

        return Inertia::render('Settings/Categories/Categories', [
            'categories' => $categories,
            'ewcCodes' => $ewcCodes,
            'hpCodes' => $hpCodes,
            'specFields' => $specFields,
        ]);
    }

    public function edit($id)
    {
        $category = Category::with(['ewcCode', 'hpCodes', 'specFields'])->findOrFail($id);

        // Pass related variables
        $ewcCodes = VariableEwcCode::all(['id', 'ewc_code']);
        $hpCodes = VariableHPCode::all(['id', 'hp_code', 'hp_type']);
        $specFields = VariableSpecField::all(['id', 'spec_name']);

        return Inertia::render('Settings/Categories/CategoriesEdit', [
            'category' => $category,
            'ewcCodes' => $ewcCodes,
            'hpCodes' => $hpCodes,
            'specFields' => $specFields,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'default_weight' => 'required|numeric|min:0',
                'ewc_code_id' => 'required|exists:variable_ewc_codes,id',
                'physical_form' => 'nullable|in:Solid,Liquid,Mixed,Sludge',
                'concentration' => 'nullable|string|max:255',
                'chemical_component' => 'nullable|string|max:255',
                'container_type' => 'nullable|string|max:255',
                'hp_codes' => 'nullable|array',
                'hp_codes.*' => 'exists:variable_hp_codes,id',
                'spec_fields' => 'nullable|array',
                'spec_fields.*' => 'exists:variable_spec_fields,id',
            ]);

            $category = Category::create($validated);

            // Sync relationships
            $category->hpCodes()->sync($request->input('hp_codes', []));
            $category->specFields()->sync($request->input('spec_fields', []));

            return response()->json($category->load(['ewcCode', 'hpCodes', 'specFields']));
        } catch (\Exception $e) {
            Log::error('Failed to store category: ' . $e->getMessage(), [
                'request' => $request->all(),
                'error' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to create category. Please check the logs for more details.'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'default_weight' => 'required|numeric|min:0',
                'ewc_code_id' => 'required|exists:variable_ewc_codes,id',
                'physical_form' => 'nullable|in:Solid,Liquid,Mixed,Sludge',
                'concentration' => 'nullable|string|max:255',
                'chemical_component' => 'nullable|string|max:255',
                'container_type' => 'nullable|string|max:255',
                'hp_codes' => 'nullable|array',
                'hp_codes.*' => 'exists:variable_hp_codes,id',
                'spec_fields' => 'nullable|array',
                'spec_fields.*' => 'exists:variable_spec_fields,id',
            ]);

            $category->update($validated);

            // Sync relationships
            $category->hpCodes()->sync($request->input('hp_codes', []));
            $category->specFields()->sync($request->input('spec_fields', []));

            return response()->json($category->load(['ewcCode', 'hpCodes', 'specFields']));
        } catch (\Exception $e) {
            Log::error('Failed to update category: ' . $e->getMessage(), [
                'request' => $request->all(),
                'error' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to update category. Please check the logs for more details.'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);
            $category->delete();

            return response()->json(['message' => 'Category deleted successfully.']);
        } catch (\Exception $e) {
            Log::error('Failed to delete category: ' . $e->getMessage(), [
                'category_id' => $id,
                'error' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to delete category. Please check the logs for more details.'], 500);
        }
    }
}