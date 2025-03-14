// In your DriverJobController or wherever the driver-jobs API endpoint is defined
public function index()
{
    // Get the current authenticated driver
    $driver = auth()->user();
    
    // Get jobs assigned to this driver
    $jobs = Job::where('staff_collecting', $driver->name)
        ->with('client')
        ->get();
    
    // For each job, count items with "added" = "Collection"
    $jobs->each(function ($job) {
        $job->items_count = JobItem::where('job_id', $job->id)
            ->where('added', 'Collection')
            ->count();
    });
    
    return response()->json($jobs);
}