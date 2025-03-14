<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JobAudit;
use Illuminate\Support\Facades\Auth;

class JobAuditController extends Controller
{
    public function index($jobId)
    {
        return JobAudit::with('staff:id,name')
            ->where('job_id', $jobId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(Request $request, $jobId)
    {
        $validated = $request->validate([
            'content' => 'required|string'
        ]);

        $audit = JobAudit::create([
            'job_id' => $jobId,
            'staff_id' => Auth::id(),
            'content' => $validated['content']
        ]);

        return $audit->load('staff:id,name');
    }

public function update(Request $request, $jobId, $entryId)
{
    $audit = JobAudit::findOrFail($entryId);
    
    if ($audit->is_system === 'true') {
        return response()->json(['message' => 'System logs cannot be edited'], 403);
    }

    if ($audit->staff_id !== auth()->id()) {
        return response()->json(['message' => 'You can only edit your own notes'], 403);
    }

    $validated = $request->validate([
        'content' => 'required|string'
    ]);

    $audit = JobAudit::findOrFail($entryId);
    $audit->update([
        'content' => $validated['content']
    ]);

    return $audit->load('staff:id,name');
}

public function destroy($jobId, $entryId)
{
    $audit = JobAudit::findOrFail($entryId);
    
    if ($audit->is_system === 'true') {
        return response()->json(['message' => 'System logs cannot be deleted'], 403);
    }

    if ($audit->staff_id !== auth()->id()) {
        return response()->json(['message' => 'You can only delete your own notes'], 403);
    }

    $audit->delete();
    return response()->noContent();
}
}