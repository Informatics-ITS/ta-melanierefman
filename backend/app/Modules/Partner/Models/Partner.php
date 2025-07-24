<?php

namespace Modules\Partner\Models;

use Modules\Research\Models\Research;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'partners';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
    ];

    public function research()
    {
        return $this->belongsToMany(Research::class)->withTimestamps(); // Relasi many-to-many
    }

    public function partners_member()
    {
        return $this->hasMany(PartnerMember::class); // Relasi one-to-many
    }
}
