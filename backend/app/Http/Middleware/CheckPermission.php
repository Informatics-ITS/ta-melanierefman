<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $entity): Response
    {
        $user = $request->user();

        if (!$user || !$user->hasPermission($entity)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
