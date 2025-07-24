<?php

namespace Modules\About\Models;

use Modules\Documentation\Models\Documentation;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class About extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'about';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'tentang',
        'about',
        'tujuan',
        'purpose',
        'address',
        'phone',
        'email',
    ];

    public function documentation()
    {
        return $this->hasMany(Documentation::class); // Relasi one-to-many
    }
}
