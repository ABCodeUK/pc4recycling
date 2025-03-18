<?php

use App\Http\Middleware\JobStatusRedirect;

return [
    'web' => [
        // ... other middleware
    ],

    'api' => [
        // ... other middleware
    ],

    'aliases' => [
        // ... other aliases
        'job.status.redirect' => JobStatusRedirect::class,
    ],
];