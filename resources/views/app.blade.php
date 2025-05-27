<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
        <link rel="apple-touch-icon" href="/images/favicons/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="96x96" href="/images/favicons/favicon-96x96.png">
        <link rel="icon" type="image/x-icon" href="/images/favicons/favicon.ico">
        <link rel="icon" type="image/svg+xml" href="/images/favicons/favicon.svg">
        <link rel="manifest" href="/images/favicons/site.webmanifest">
        <link rel="icon" type="image/png" sizes="192x192" href="/images/favicons/favicons/web-app-192x192.png">
        <link rel="icon" type="image/png" sizes="512x512" href="/images/favicons/favicons/web-app-512x512.png">
    </head>
    <body class="font-sans antialiased">
        @inertiaHead
        @inertia

        <!-- Pass authenticated user data to JavaScript -->
        <script>
            window.Laravel = {
                user: @json(auth()->user())
            };
        </script>
    </body>
</html>
