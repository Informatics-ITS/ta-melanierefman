<?php

namespace Modules\Research\Models;

use Modules\User\Models\User;
use Modules\ResearchProgress\Models\ResearchProgress;
use Modules\Member\Models\Member;
use Modules\Partner\Models\Partner;
use Modules\Publication\Models\Publication;
use Modules\Documentation\Models\Documentation;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Research extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'research';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'judul',
        'title',
        'deskripsi',
        'description',
        'latitude',
        'longitude',
        'zoom',
        'start_date',
        'end_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function research_progress()
    {
        return $this->hasMany(ResearchProgress::class); // Relasi one-to-many
    }

    public function publication()
    {
        return $this->hasOne(Publication::class); // Relasi one-to-one
    }

    public function members()
    {
        return $this->belongsToMany(Member::class, 'members_research')->withPivot('is_coor')->withTimestamps(); // Relasi many-to-many
    }

    public function partners()
    {
        return $this->belongsToMany(Partner::class)->withTimestamps(); // Relasi many-to-many
    }

    public function documentations()
    {
        return $this->belongsToMany(Documentation::class, 'documentation_research', 'research_id', 'documentation_id')
            ->withPivot('is_thumbnail')
            ->withTimestamps();
    }
}
