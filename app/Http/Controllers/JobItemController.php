<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\JobItem;
use App\Models\Job;  // Change back to using Job model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JobItemController extends Controller
{
    public function index($jobId)
    {
        Log::info('Fetching items for jobId: ' . $jobId);
    
        try {
            // Change back to using Job model
            $job = Job::where('job_id', $jobId)->firstOrFail();
            
            // Fetch all item numbers including soft deleted ones
            $existingItemNumbers = JobItem::where('job_id', $job->id)
                ->withTrashed() // Includes soft-deleted items
                ->pluck('item_number')
                ->toArray();
            
            $items = JobItem::where('job_id', $job->id)
                ->with(['category' => function($query) {
                    $query->with('subCategories');
                }])
                ->orderBy('item_number')
                ->get(); // Does not include soft-deleted items
            
            return response()->json([
                'items' => $items,
                'existingItemNumbers' => $existingItemNumbers
            ]);
        } catch (\Exception $e) {
            Log::error('Error in JobItemController@index: ' . $e->getMessage(), [
                'jobId' => $jobId,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to fetch items: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request, $jobId)
    {
        try {
            // Debug the exact structure of incoming data
            Log::info('Raw request data:', [
                'all' => $request->all(),
                'items' => $request->items,
                'first_item' => $request->items[0] ?? null
            ]);
    
            // Simplify the validation for now
            $request->validate([
                'items' => 'required|array',
                'items.*.item_number' => 'required|string',
            ]);
    
            $job = Job::where('job_id', $jobId)->firstOrFail();
    
            // Fetch existing items for the job
            $existingItems = JobItem::where('job_id', $job->id)->get()->keyBy('item_number');
    
            $incomingItems = collect($request->items);
            $processedItemNumbers = [];
    
            \DB::beginTransaction();
    
            foreach ($incomingItems as $item) {
                $processedItemNumbers[] = $item['item_number'];
    
                if ($existingItems->has($item['item_number'])) {
                    // Update existing item
                    $existingItem = $existingItems->get($item['item_number']);
                    $existingItem->update([
                        'quantity' => (int)($item['quantity'] ?? 1),
                        'category_id' => !empty($item['category_id']) ? (int)$item['category_id'] : null,
                        'sub_category_id' => !empty($item['sub_category_id']) ? (int)$item['sub_category_id'] : null,
                        'make' => $item['make'] ?? null,
                        'model' => $item['model'] ?? null,
                        'specification' => $item['specification'] ?? null,
                        'erasure_required' => $item['erasure_required'] ?? null,
                        'image_path' => $item['image_path'] ?? null,
                        'processing_make' => $item['processing_make'] ?? null,
                        'processing_model' => $item['processing_model'] ?? null,
                        'processing_specification' => $item['processing_specification'] ?? null,
                        'processing_erasure_required' => $item['processing_erasure_required'] ?? null,
                        'added' => $existingItem->added ?? 'Collection',
                        'updated_at' => now()
                    ]);
                } else {
                    // Create new item
                    JobItem::create([
                        'job_id' => $job->id,
                        'item_number' => $item['item_number'],
                        'quantity' => (int)($item['quantity'] ?? 1),
                        'category_id' => !empty($item['category_id']) ? (int)$item['category_id'] : null,
                        'sub_category_id' => !empty($item['sub_category_id']) ? (int)$item['sub_category_id'] : null,
                        'make' => $item['make'] ?? null,
                        'model' => $item['model'] ?? null,
                        'specification' => $item['specification'] ?? null,
                        'erasure_required' => $item['erasure_required'] ?? null,
                        'image_path' => $item['image_path'] ?? null,
                        'processing_make' => $item['processing_make'] ?? null,
                        'processing_model' => $item['processing_model'] ?? null,
                        'processing_specification' => $item['processing_specification'] ?? null,
                        'processing_erasure_required' => $item['processing_erasure_required'] ?? null,
                        'added' => 'Collection',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }
    
            // Soft delete items not in the incoming request
            JobItem::where('job_id', $job->id)
                ->whereNotIn('item_number', $processedItemNumbers)
                ->delete();
    
            \DB::commit();
    
            return response()->json([
                'message' => 'Items saved successfully',
                'items' => $incomingItems
            ]);
    
        } catch (\Exception $e) {
            \DB::rollBack();
            Log::error('Store failed:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
    
            return response()->json([
                'error' => 'Failed to save items',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $jobId, $itemId)
    {
        try {
            $item = JobItem::where('job_id', $jobId)
                ->where('id', $itemId)
                ->firstOrFail();

            $item->update($request->all());

            return response()->json($item);
        } catch (\Exception $e) {
            Log::error('Failed to update job item: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update item'], 500);
        }
    }

    public function destroy($jobId, $itemId)
    {
        try {
            Log::info('Attempting to delete item:', ['job_id' => $jobId, 'item_id' => $itemId]);
        
            $item = JobItem::where('id', $itemId)->firstOrFail();
        
            // Soft delete the item
            $item->delete();
        
            Log::info('Item deleted successfully');
    
            return response()->json(['message' => 'Item deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete job item:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to delete item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function generateItemNumber($jobId)
    {
        try {
            $job = Job::where('job_id', $jobId)->firstOrFail();
    
            // Fetch all item numbers including soft deleted ones
            $existingItemNumbers = JobItem::where('job_id', $job->id)
                ->withTrashed() // Includes soft-deleted items
                ->pluck('item_number')
                ->toArray();
    
            // Find the next available unique item number
            $counter = 1;
            do {
                $newItemNumber = $jobId . '-' . str_pad($counter, 2, '0', STR_PAD_LEFT);
                $counter++;
            } while (in_array($newItemNumber, $existingItemNumbers));
    
            return response()->json(['item_number' => $newItemNumber]);
        } catch (\Exception $e) {
            Log::error('Error generating item number: ' . $e->getMessage(), [
                'jobId' => $jobId,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to generate item number'], 500);
        }
    }
}