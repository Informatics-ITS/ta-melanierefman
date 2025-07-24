<?php

namespace Modules\User\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Modules\Lecturer\Models\Lecturer;
use Modules\Member\Models\Member;
use Modules\Partner\Models\Partner;
use Modules\Publication\Models\Publication;
use Modules\Research\Models\Research;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public static function validRoles()
    {
        return ['superadmin', 'admin'];
    }

    public function research()
    {
        return $this->hasMany(Research::class);
    }

    public function publication()
    {
        return $this->hasMany(Publication::class);
    }

    public function lecturer()
    {
        return $this->hasMany(Lecturer::class);
    }

    public function partner()
    {
        return $this->hasMany(Partner::class);
    }

    public function member()
    {
        return $this->hasOne(Member::class); // Relasi one-to-one
    }
}
