<?php

namespace App\Exceptions;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Exception\RouteNotFoundException;
use League\OAuth2\Server\Exception\OAuthServerException;
use Laravel\Passport\Exceptions\OAuthServerException as PassportOAuthServerException;
use Throwable;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        \Laravel\Passport\Exceptions\OAuthServerException::class,
        \League\OAuth2\Server\Exception\OAuthServerException::class,
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function report(Throwable $exception)
    {
        parent::report($exception);
    }


    /**
     * @param Request $request
     * @param Throwable $e
     * @throws Throwable
     */
    public function render($request, Throwable $e)
    {
        // This will replace our 404 response with
        // a JSON response.
        if ($e instanceof UnauthorizedException) {
            return response()->json([
                'status' => false,
                'message'=> __('You do not have the required authorization.'),
                'data' => $e->getMessage(),
                'error_code' => Response::HTTP_FORBIDDEN,
            ], Response::HTTP_FORBIDDEN);
        }else if ($e instanceof NotFoundHttpException || $e instanceof ModelNotFoundException || $e instanceof RouteNotFoundException) {
            return response()->json([
                'status' => false,
                'message'=> __('resource_not_found'),
                'data' => $e->getMessage(),
                'error_code' => Response::HTTP_NOT_FOUND,
            ], Response::HTTP_NOT_FOUND);
        } else if ($e instanceof PassportOAuthServerException || $e instanceof AccessDeniedHttpException || ($e instanceof OAuthServerException && $e->getCode() == 9)) {
            return response()->json([
                'status' => false,
                'message'=>  __("This action is unauthorized"),
                'data' => null,
                'error_code' => Response::HTTP_BAD_REQUEST,
            ], Response::HTTP_BAD_REQUEST);
        } else if ($e instanceof ValidationException) {
            return response()->json([
                'status' => false,
                'message'=>  $e->errors(),
                'data' => null,
                'error_code' => Response::HTTP_BAD_REQUEST,
            ], Response::HTTP_BAD_REQUEST);
        } else if ($e instanceof MethodNotAllowedHttpException) {
            return response()->json([
                'status' => false,
                'message'=>  __('method_not_allowed'),
                'data' => null,
                'error_code' => Response::HTTP_BAD_REQUEST,
            ], Response::HTTP_BAD_REQUEST);
        }

        return parent::render($request, $e);
    }
}
