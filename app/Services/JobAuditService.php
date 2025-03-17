<?php

namespace App\Services;

use App\Models\JobAudit;
use Illuminate\Support\Facades\Auth;

class JobAuditService
{
    public static function log(int $jobId, string $action, string $isSystem = 'false')
    {
        $systemMessages = [
            'mark_collected' => 'Job marked as Collected',
            'job_created' => 'Job Created',  // Add this line
            // Add more system messages here as needed
        ];

        return JobAudit::create([
            'job_id' => $jobId,
            'staff_id' => Auth::id(),
            'content' => $systemMessages[$action] ?? $action,
            'is_system' => $isSystem
        ]);
    }
}