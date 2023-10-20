<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class WebController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index()
    {
        return response()->json(['status' => false, 'message' => __('Access denied.')]);
    }
}
