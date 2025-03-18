protected $routeMiddleware = [

    'job.status.redirect' => \App\Http\Middleware\JobStatusRedirect::class,
];