import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";

export default function PosPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        Swal.fire({
          icon: "warning",
          title: "Sesi Habis",
          text: "Silakan login ulang.",
        });
        navigate("/");
      }
    }
  };

  const addToCart = (product) => {
    if (product.stock === 0)
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Stok barang ini sudah habis!",
      });

    setCart((prevCart) => {
      const isExist = prevCart.find((item) => item.id === product.id);
      if (isExist) {
        if (isExist.quantity >= product.stock) {
          Swal.fire({
            icon: "warning",
            title: "Batas Stok",
            text: `Stok ${product.name} hanya tersisa ${product.stock}!`,
          });
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (cart.length === 0)
      return Swal.fire({
        icon: "info",
        title: "Keranjang Kosong",
        text: "Silakan pilih produk terlebih dahulu.",
      });

    let finalAmountPaid = totalAmount;
    let changeAmount = 0;

    if (paymentMethod === "Tunai") {
      const { value: inputUang, isConfirmed } = await Swal.fire({
        title: "Pembayaran Tunai",
        input: "number",
        inputLabel: `Total Tagihan: Rp ${totalAmount.toLocaleString()}`,
        inputPlaceholder: "Masukkan uang dari pelanggan...",
        showCancelButton: true,
        confirmButtonText: "Proses Pembayaran",
        cancelButtonText: "Batal",
        confirmButtonColor: "#3b82f6",
        inputValidator: (value) => {
          if (!value) return "Jumlah uang harus diisi!";
          if (parseInt(value) < totalAmount)
            return "Uang tidak cukup untuk membayar tagihan!";
        },
      });

      if (!isConfirmed) return;
      finalAmountPaid = parseInt(inputUang);
      changeAmount = finalAmountPaid - totalAmount;
    } else if (paymentMethod === "QRIS") {
      const { isConfirmed } = await Swal.fire({
        title: "Scan QRIS untuk Membayar",
        html: `
                    <div class="flex flex-col items-center justify-center p-4">
                        <p class="text-gray-600 mb-4">Total Tagihan: <span class="text-3xl font-black text-blue-600 block mt-1">Rp ${totalAmount.toLocaleString()}</span></p>
                        <div class="bg-white p-4 rounded-2xl shadow-lg border-4 border-blue-100 mb-4">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Pembayaran+Venta+POS+Rp+${totalAmount}" alt="QRIS" class="mx-auto rounded-lg" />
                        </div>
                        <p class="text-sm text-gray-500 font-semibold bg-blue-50 p-3 rounded-lg border border-blue-100">
                            📱 Minta pelanggan scan QR ini menggunakan aplikasi GoPay, OVO, DANA, ShopeePay.
                        </p>
                    </div>
                `,
        showCancelButton: true,
        confirmButtonText: "✅ Konfirmasi Pembayaran",
        cancelButtonText: "Batal",
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#ef4444",
        allowOutsideClick: false,
      });

      if (!isConfirmed) return;
    } else {
      const { isConfirmed } = await Swal.fire({
        title: `Pembayaran ${paymentMethod}`,
        text: `Pastikan pelanggan sudah menggesek kartu dan memasukkan PIN sebesar Rp ${totalAmount.toLocaleString()}`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Sudah Bayar",
        cancelButtonText: "Batal",
        confirmButtonColor: "#10b981",
      });
      if (!isConfirmed) return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        cart: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
      };
      const response = await api.post("/transactions", payload);

      const newReceipt = {
        id:
          response.data.transaction?.id ||
          Math.floor(Math.random() * 90000) + 10000,
        date: new Date().toLocaleString("id-ID"),
        items: [...cart],
        total: totalAmount,
        method: paymentMethod,
        paid: finalAmountPaid,
        change: changeAmount,
      };

      setReceiptData(newReceipt);
      setCart([]);
      setPaymentMethod("Tunai");
      fetchProducts();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Transaksi Gagal",
        text: error.response?.data?.message || "Terjadi kesalahan server.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const printReceipt = () => {
    const printContent = document.getElementById("printable-receipt").innerHTML;
    const printWindow = window.open("", "", "width=400,height=600");
    printWindow.document.write(`
            <html>
                <head>
                    <title>Cetak Struk</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="p-4 flex justify-center bg-gray-200">
                    <div class="w-full max-w-sm bg-white shadow-lg p-6 font-mono text-sm border-t-4 border-gray-800">${printContent}</div>
                </body>
            </html>
        `);
    printWindow.document.close();
    printWindow.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 800);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans relative">
      {/* ================= MODAL STRUK ================= */}
      {receiptData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh] animate-[scale-up_0.2s_ease-out]">
            <div className="p-4 bg-blue-600 text-white flex justify-between items-center shadow-md z-10">
              <h2 className="font-bold text-lg">✅ Transaksi Berhasil!</h2>
            </div>

            <div
              className="p-6 overflow-y-auto bg-[#fdfdfd]"
              id="printable-receipt"
            >
              <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-5">
                <h3 className="text-2xl font-black text-gray-800 tracking-widest mb-1">
                  VENTA POS
                </h3>
                <p className="text-xs text-gray-500 font-semibold">
                  Minimarket & Retail System
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Jl. Teknologi Cerdas No. 99
                </p>
              </div>

              <div className="mb-4 text-xs text-gray-700 font-bold space-y-1">
                <div className="flex justify-between">
                  <span>No. TRX:</span> <span>#TRX-{receiptData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span> <span>{receiptData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span> <span>Staff Utama</span>
                </div>
              </div>

              <div className="border-t-2 border-b-2 border-dashed border-gray-300 py-4 mb-4 space-y-3">
                {receiptData.items.map((item) => (
                  <div key={item.id} className="text-xs text-gray-800">
                    <p className="font-bold">{item.name}</p>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-gray-500">
                        {item.quantity} x {item.price.toLocaleString()}
                      </span>
                      <span className="font-extrabold text-right">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm text-gray-800 font-bold mb-6">
                <div className="flex justify-between items-center text-lg font-black text-gray-900">
                  <span>TOTAL</span>
                  <span>Rp {receiptData.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Metode:</span>
                  <span>{receiptData.method}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {receiptData.method === "Tunai"
                      ? "Tunai (Diberikan):"
                      : "Dibayar Tunai/Transfer:"}
                  </span>
                  <span>Rp {receiptData.paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 text-blue-600">
                  <span>KEMBALIAN:</span>
                  <span>Rp {receiptData.change.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center mt-6 text-xs font-bold text-gray-500">
                <p>TERIMA KASIH ATAS BELANJA ANDA</p>
                <p className="font-normal mt-1 text-[10px]">
                  Barang yang sudah dibeli tidak dapat ditukar.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex gap-2 border-t border-gray-200">
              <button
                onClick={printReceipt}
                className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                🖨️ Cetak
              </button>
              <button
                onClick={() => setReceiptData(null)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= AKHIR MODAL STRUK ================= */}

      <div className="w-2/3 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">Menu Kasir</h1>
          <div className="flex items-center gap-4">
            {JSON.parse(localStorage.getItem("user"))?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="bg-slate-800 text-white font-bold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
              >
                Dashboard Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ================= DAFTAR KARTU PRODUK (SEKARANG DENGAN GAMBAR!) ================= */}
        <div className="grid grid-cols-3 gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${product.stock > 0 ? "border-transparent hover:border-blue-500" : "opacity-50 grayscale cursor-not-allowed"}`}
            >
              {/* Kotak Gambar */}
              <div className="h-36 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-300">🛒</span>
                )}

                {/* Label Stok Habis */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                    <span className="text-white font-bold text-lg tracking-wider">
                      HABIS
                    </span>
                  </div>
                )}
              </div>

              {/* Kotak Informasi Teks */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight h-10 mb-1">
                  {product.name}
                </h3>
                <div className="flex justify-between items-end mt-2">
                  <p className="text-blue-600 font-black text-lg">
                    Rp {product.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded">
                    Stok:{" "}
                    <span
                      className={
                        product.stock < 10 ? "text-red-500 font-bold" : ""
                      }
                    >
                      {product.stock}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* ================= AKHIR DAFTAR PRODUK ================= */}
      </div>

      <div className="w-1/3 bg-white p-6 shadow-2xl flex flex-col justify-between border-l border-gray-200 z-10">
        <div className="flex-1 overflow-hidden flex flex-col">
          <h2 className="text-2xl font-extrabold border-b-2 border-dashed border-gray-300 pb-4 mb-4 text-gray-800">
            Detail Pesanan
          </h2>

          <div className="overflow-y-auto flex-1 pr-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-5xl mb-3">🧾</span>
                <p className="font-semibold">Belum ada pesanan</p>
              </div>
            ) : null}

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center mb-3 bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="flex-1 pr-2">
                  <p className="font-bold text-gray-800 text-sm leading-tight mb-1">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 font-semibold text-blue-600">
                    Rp {item.price.toLocaleString()} x {item.quantity}
                  </p>
                </div>
                <p className="font-extrabold text-gray-800">
                  Rp {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 pt-5 mt-4">
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Metode Pembayaran
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border-2 border-gray-200 p-3 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 font-semibold text-gray-700 cursor-pointer"
            >
              <option value="Tunai">💵 Uang Tunai (Cash)</option>
              <option value="QRIS">📱 QRIS (Gopay/Ovo/Dana)</option>
              <option value="Debit Card">💳 Kartu Debit / Kredit</option>
            </select>
          </div>

          <div className="flex justify-between items-center mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-inner">
            <span className="text-lg font-bold text-blue-900">
              Total Tagihan
            </span>
            <span className="text-3xl font-extrabold text-blue-700 tracking-tight">
              Rp {totalAmount.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isProcessing || cart.length === 0}
            className={`w-full py-4 rounded-2xl font-extrabold text-lg text-white shadow-xl transition-all ${cart.length === 0 ? "bg-gray-300 cursor-not-allowed shadow-none" : isProcessing ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-blue-500/50"}`}
          >
            {isProcessing
              ? "Memproses..."
              : `Bayar Sekarang (${paymentMethod})`}
          </button>
        </div>
      </div>
    </div>
  );
}
