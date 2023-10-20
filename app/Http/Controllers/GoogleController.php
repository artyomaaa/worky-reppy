<?php

namespace App\Http\Controllers;

use App\Services\Interfaces\UserServiceInterface;
use Google_Service_Calendar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GoogleController extends Controller
{
    /**
     * @var UserServiceInterface
     */
    private $userService;

    /**
     * UsersController constructor.
     * @param UserServiceInterface $userService
     */
    public function __construct(
        UserServiceInterface $userService
    )
    {
        $this->userService = $userService;
    }
    /**
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function checkCalendarConnection(Request $request, int $userId): JsonResponse
    {
        // todo maybe check permission to this action
        $loggedUser = $request->user();
        if (!$loggedUser->can('view others google calendar connection')) {
            if ($loggedUser->id !== $userId) {
                return response()->json([
                    'status' => false,
                    'message' => __('Access denied to see google calendar connection'),
                ], 400);
            }
        }

        $storageGoogleTokenPath = $this->userService->getStorageGoogleTokenPath($userId);

        return response()->json([
            'status' => true,
            'message' => __('Success'),
            'googleCalendarConnected' => Storage::exists($storageGoogleTokenPath),
            'userId' => $userId
        ]);
    }

    /**
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     * @throws \Exception
     */
    public function authUrl(Request $request, int $userId): JsonResponse
    {
        // todo maybe check permission to this action
        $loggedUser = $request->user();
        if (!$loggedUser->can('view others google auth url')) {
            if ($loggedUser->id !== $userId) {
                return response()->json([
                    'status' => false,
                    'message' => __('Access denied to view google auth url'),
                ], 400);
            }
        }

        $storageGoogleTokenPath = $this->userService->getStorageGoogleTokenPath($userId);
        $googleAuthUrl = null;
        if (!Storage::exists($storageGoogleTokenPath)) {
            $googleAuthUrl = $this->userService->getGoogleAuthUrl($userId);
        }

        return response()->json([
            'status' => true,
            'message' => __('Success'),
            'googleCalendarTokenExists' => Storage::exists($storageGoogleTokenPath),
            'userId' => $userId,
            'googleAuthUrl' => $googleAuthUrl
        ]);
    }

    /**
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     * @throws \Exception
     */
    public function addCalendarToken(Request $request, int $userId): JsonResponse
    {
        $loggedUser = $request->user();
        if (!$loggedUser->can('add others google calendar token')) {
            if ($loggedUser->id !== $userId) {
                return response()->json([
                    'status' => false,
                    'message' => __('Access denied to add google calendar token'),
                ], 400);
            }
        }
        $authCode = $request->code;
        if (empty($authCode) || $request->scope !== Google_Service_Calendar::CALENDAR) {
            return response()->json([
                'status' => false,
                'message' => __('Invalid code or scope'),
            ], 400);
        }

        $storageGoogleTokenPath = $this->userService->getStorageGoogleTokenPath($userId);
        $googleAuthUrl = null;
        if (!Storage::exists($storageGoogleTokenPath)) {
            $client = $this->userService->getGoogleClientWithUncheckedAccessToken($userId);
            if ($client->isAccessTokenExpired()) {
                // Refresh the token if possible, else fetch a new one.
                if ($client->getRefreshToken()) {
                    $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
                } else {
                    // Exchange authorization code for an access token.
                    $accessToken = $client->fetchAccessTokenWithAuthCode($authCode);
                    $client->setAccessToken($accessToken);

                    // Check to see if there was an error.
                    if (array_key_exists('error', $accessToken)) {
                        return response()->json([
                            'status' => false,
                            'message' => __('Something wrong with token'),
                        ], 400);
                    }
                }
                // Save the token to a file.
                Storage::disk('local')->put($storageGoogleTokenPath, json_encode($client->getAccessToken()));
            }
        }

        return response()->json([
            'status' => true,
            'message' => __('Success'),
        ]);
    }

    /**
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     * @throws \Exception
     */
    public function removeCalendarToken(Request $request, int $userId): JsonResponse
    {
        $loggedUser = $request->user();
        if (!$loggedUser->can('remove others google calendar token')) {
            if ($loggedUser->id !== $userId) {
                return response()->json([
                    'status' => false,
                    'message' => __('Access denied to remove google calendar token'),
                ], 400);
            }
        }

        $storageGoogleTokenPath = $this->userService->getStorageGoogleTokenPath($userId);
        if (Storage::exists($storageGoogleTokenPath)) {
            if (Storage::delete($storageGoogleTokenPath)) {
                return response()->json([
                    'status' => true,
                    'message' => __('Success'),
                    'removed' => true,
                ]);
            }
        }

        return response()->json([
            'status' => false,
            'message' => __('Something went wrong'),
            'removed' => false,
        ]);
    }
}
