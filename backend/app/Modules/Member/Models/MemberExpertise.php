<?php

namespace Modules\Member\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberExpertise extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'members_expertise';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'keahlian',
        'expertise',
    ];

    public function members()
    {
        return $this->belongsToMany(Member::class, 'members_members_expertise', 'members_expertise_id', 'member_id')->withTimestamps();
    }
}
