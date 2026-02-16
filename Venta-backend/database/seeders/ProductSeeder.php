<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'Indomie Mi Goreng Spesial 85gr', 'price' => 3100, 'stock' => 200, 'image' => 'https://images.unsplash.com/photo-1612929633738-8fe01f37e47c?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Aqua Air Mineral Botol 600ml', 'price' => 3500, 'stock' => 150, 'image' => 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Teh Pucuk Harum 350ml', 'price' => 4000, 'stock' => 120, 'image' => 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Chitato Rasa Sapi Panggang 68gr', 'price' => 11500, 'stock' => 50, 'image' => 'https://images.unsplash.com/photo-1566478989037-e924e622ceea?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Sari Roti Sandwich Coklat', 'price' => 6000, 'stock' => 30, 'image' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Susu Bear Brand 189ml', 'price' => 10500, 'stock' => 80, 'image' => 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Silverqueen Cashew 58gr', 'price' => 17000, 'stock' => 40, 'image' => 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Tolak Angin Cair Sido Muncul', 'price' => 4500, 'stock' => 100, 'image' => 'https://images.unsplash.com/photo-1587049352851-8d4e8913475f?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Pepsodent Pasta Gigi 190gr', 'price' => 12500, 'stock' => 60, 'image' => 'https://images.unsplash.com/photo-1559598467-f8b76c8105d0?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Lifebuoy Sabun Mandi Cair 450ml', 'price' => 25000, 'stock' => 45, 'image' => 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Bimoli Minyak Goreng Pouch 2L', 'price' => 38000, 'stock' => 25, 'image' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Beras Setra Ramos Premium 5kg', 'price' => 75000, 'stock' => 20, 'image' => 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Rinso Anti Noda Bubuk 770gr', 'price' => 22000, 'stock' => 35, 'image' => 'https://images.unsplash.com/photo-1610555356070-d1fb336f1ae8?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Sunlight Sabun Cuci Piring 750ml', 'price' => 15000, 'stock' => 50, 'image' => 'https://images.unsplash.com/photo-1584813539806-2538b8d918c6?w=500&auto=format&fit=crop&q=80'],
            ['name' => 'Teh Botol Sosro 450ml', 'price' => 3000, 'stock' => 100, 'image' => 'https://images.unsplash.com/photo-1527661591450-b44519eb8ab0?w=500&auto=format&fit=crop&q=80'],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
