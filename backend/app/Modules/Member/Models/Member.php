<?php

namespace Modules\Member\Models;

use Modules\Research\Models\Research;
use Modules\User\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'members';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'role',
        'is_alumni',
        'is_head',
        'email',
        'phone',
        'scopus_link',
        'scholar_link',
        'judul_project',
        'project_title',
        'image',
        'member_id',
        'user_id',
    ];

    public static function validRoles()
    {
        return ['researcher', 'postdoc', 'research assistant', 'student'];
    }

    public function members_education()
    {
        return $this->hasMany(MemberEducation::class); // Relasi one-to-many
    }

    public function members_expertise()
    {
        return $this->belongsToMany(MemberExpertise::class, 'members_members_expertise', 'member_id', 'members_expertise_id')->withTimestamps();
    }

    public function research()
    {
        return $this->belongsToMany(Research::class, 'members_research')->withPivot('is_coor')->withTimestamps(); // Relasi many-to-many
    }

    public function user()
    {
        return $this->belongsTo(User::class); // Relasi one-to-one
    }
}
