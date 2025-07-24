<?php

namespace Modules\Partner\Models;

use Illuminate\Database\Eloquent\Model;

class PartnerMember extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'partners_member';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
    ];

    public function partners()
    {
        return $this->belongsTo(Partner::class); // Relasi one-to-many
    }
}
