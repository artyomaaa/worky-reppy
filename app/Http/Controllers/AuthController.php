<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegistrationRequest;
use App\Services\Interfaces\UserServiceInterface;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{

    /**
     * @var UserServiceInterface
     */
    private $userService;


    public function __construct(UserServiceInterface $userService)
    {
        $this->userService = $userService;
    }
    /**
     * Get the login username to be used by the controller.
     *
     * @return string
     */
    public function username()
    {
        return 'email';
    }


    /**
     * @param Request $request
     * @return mixed
     * @throws \Illuminate\Validation\ValidationException
     */
    public function login(Request $request)
    {
        // CHECK IF USER IS ACTIVE
        $active = $this->userService->checkActiveUserByEmail($request->email);
        if(!$active){
            return response()->json(['status' => false, 'message' => __('user_is_inactive'), 'data' => null], 403);
        }

        try{
            $this->validateLogin($request);

            $http = new \GuzzleHttp\Client;

            $form_params = [
                'grant_type' => 'password',
                'client_id' => env('PASSWORD_CLIENT_ID'),
                'client_secret' => env('PASSWORD_CLIENT_SECRET'),
                'username' => $request->email,
                'password' => $request->password,
                'scope' => '',
            ];

            $response = $http->post(env('APP_URL') . '/oauth/token', [
                'form_params' => $form_params,
            ]);
            return response()->json(['status' => true, 'message' => __('login_data'), 'data' => json_decode((string) $response->getBody(), true)]);
        }catch (\Exception $exception) {
            return response()->json(['status' => false, 'message' => __('invalid_data'), 'data' => null]);
        }
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $deletedStatus = false;
        if (Auth::check()) {
            $deletedStatus = $request->user()->token()->delete();
        }

        return response()->json(['status' => $deletedStatus, 'message' => __('user_logout'), 'data' => null]);
    }

    /**
     * Validate the user login request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return void
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function validateLogin(Request $request)
    {
        $request->validate([
            $this->username() => 'required|string',
            'password' => 'required|string',
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param RegistrationRequest $request
     * @return JsonResponse
     */
    public function registration(RegistrationRequest $request): JsonResponse
    {
        $user = $this->userService->userRegistration($request);
        if ($user) {
            return response()->json(['status' => true, 'message' => __('User added successfully, please enter your Email and verify...'), 'user' => $user]);
        }
        return response()->json(['status' => false, 'message' => __('You could not register,try again...'), 'user' => null]);
    }
}
