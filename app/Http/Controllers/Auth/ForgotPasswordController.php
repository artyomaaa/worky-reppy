<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ForgotPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset emails and
    | includes a trait which assists in sending these notifications from
    | your application to your users. Feel free to explore this trait.
    |
    */

    use SendsPasswordResetEmails;

    protected function sendResetLinkResponse(Request $request, $response): JsonResponse
    {
        return response()->json(['status' => true, 'message' => __("passwords.reset_link_success")], 200);
    }

    protected function sendResetLinkFailedResponse(Request $request, $response): JsonResponse
    {
        return response()->json(['status' => false, 'message' => __("passwords.reset_link_error")], 200);
    }
}
