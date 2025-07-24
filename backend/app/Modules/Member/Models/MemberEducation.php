<?php

namespace Modules\Member\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberEducation extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'members_education';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'degree',
        'major',
        'university',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
