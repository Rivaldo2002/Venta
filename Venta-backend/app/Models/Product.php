<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // TAMBAHKAN BARIS INI: Mengizinkan Laravel mengisi kolom-kolom ini
    protected $fillable = [
        'name',
        'price',
        'stock',
        'image'
    ];
}
