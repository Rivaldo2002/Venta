<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'cart' => 'required|array',
            'cart.*.id' => 'required|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $totalAmount = 0;

            $transaction = Transaction::create([
                'user_id' => $request->user()->id,
                'total_amount' => 0,
            ]);

            foreach ($request->cart as $item) {
                $product = Product::lockForUpdate()->find($item['id']);

                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Stok untuk {$product->name} tidak mencukupi.");
                }

                $product->decrement('stock', $item['quantity']);

                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price_at_transaction' => $product->price,
                ]);

                $totalAmount += $product->price * $item['quantity'];
            }

            $transaction->update(['total_amount' => $totalAmount]);

            DB::commit();

            return response()->json([
                'message' => 'Transaksi berhasil',
                'data' => $transaction->load('details')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function reports()
    {
        $totalRevenue = Transaction::sum('total_amount');

        $totalTransactions = Transaction::count();

        $bestSellers = DB::table('transaction_details')
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->select('products.name', DB::raw('SUM(transaction_details.quantity) as total_sold'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        return response()->json([
            'total_revenue' => $totalRevenue,
            'total_transactions' => $totalTransactions,
            'best_sellers' => $bestSellers
        ]);
    }


    public function index()
    {
        // Mengambil transaksi BESERTA detail barangnya
        $transactions = Transaction::with('details.product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transactions);
    }
}
