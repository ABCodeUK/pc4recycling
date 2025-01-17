<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }

    public function sendResetLinkForStaff(Request $request, $id)
    {
        // Find the staff member by ID
        $user = User::findOrFail($id);

        // Ensure the user is a staff member
        if ($user->type !== 'Staff') {
            return response()->json(['error' => 'Invalid user type'], 422);
        }

        // Send the reset link
        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Reset link sent successfully.']);
        }

        return response()->json(['error' => 'Failed to send reset link.'], 500);
    }
    
    public function sendResetLinkForClient(Request $request, $id)
    {
        // Find the staff member by ID
        $user = User::findOrFail($id);

        // Ensure the user is a client
        if ($user->type !== 'Client') {
            return response()->json(['error' => 'Invalid user type'], 422);
        }

        // Send the reset link
        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Reset link sent successfully.']);
        }

        return response()->json(['error' => 'Failed to send reset link.'], 500);
    }
}
