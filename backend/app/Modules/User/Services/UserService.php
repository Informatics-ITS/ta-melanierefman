<?php

namespace Modules\User\Services;

use App\Mail\EmailUpdated;
use App\Mail\PasswordUpdated;
use Modules\User\Models\User;
use App\Mail\UserAccountCreated;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class UserService
{
    public function create(array $validated): User
    {
        $plainPassword = $validated['password'];

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        Mail::to($validated['email'])->send(new UserAccountCreated($validated['email'], $plainPassword));

        return $user;
    }

    public function update(int $id, array $validated, $request)
    {
        $user = User::find($id);
        if (!$user) {
            return ['error' => 'User not found', 'status' => 404];
        }

        $currentUser = Auth::user();

        if ($currentUser->role !== 'superadmin' && $currentUser->id !== $user->id) {
            return ['error' => 'Unauthorized to update other users', 'status' => 403];
        }

        $plaintextPassword = null;

        if (!empty($validated['password'])) {
            $plaintextPassword = $validated['password'];
            $user->password = Hash::make($validated['password']);
        }

        $emailChanged = isset($validated['email']) && $validated['email'] !== $user->email;

        unset($validated['password']);

        $user->fill($validated);

        if ($currentUser->role === 'superadmin' && isset($validated['role'])) {
            $user->role = $validated['role'];
        }

        $user->save();

        if ($plaintextPassword) {
            Mail::to($user->email)->send(new PasswordUpdated($user, $plaintextPassword));
        }

        if ($emailChanged) {
            $sendPassword = $plaintextPassword ?? 'Your password was not changed';
            Mail::to($user->email)->send(new EmailUpdated($user, $sendPassword));
        }

        return ['user' => $user];
    }

    public function delete(int $id): array
    {
        $user = User::find($id);

        if (!$user) {
            return ['error' => 'User not found', 'status' => 404];
        }

        $this->cleanupUserRelations($user);
        $user->delete();

        return ['success' => true];
    }

    private function sendNotificationEmails(User $user, ?string $plaintextPassword, bool $emailChanged): void
    {
        if ($plaintextPassword) {
            Mail::to($user->email)->send(new PasswordUpdated($user, $plaintextPassword));
        }

        if ($emailChanged) {
            $sendPassword = $plaintextPassword ?? 'Your password was not changed';
            Mail::to($user->email)->send(new EmailUpdated($user, $sendPassword));
        }
    }

    private function cleanupUserRelations(User $user): void
    {
        $user->research()->each(function ($research) {
            $research->partners()->delete();
            $research->publication()->delete();
            $research->documentations()->delete();
            $research->delete();
        });

        $user->lecturer()->delete();

        if ($user->member) {
            $user->member()->delete();
        }
    }
}
