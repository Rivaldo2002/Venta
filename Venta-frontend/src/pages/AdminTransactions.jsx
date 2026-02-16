import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // STATE BARU: Untuk menyimpan data transaksi yang sedang di-klik (untuk Struk)
  const [selectedTrx, setSelectedTrx] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      Swal.fire({
        icon: "error",
        title: "Akses Ditolak",
        text: "Hanya Admin.",
      });
      navigate("/pos");
    } else {
      fetchTransactions();
    }
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/transactions");
      const dataTrx = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setTransactions(dataTrx);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const filteredTransactions = transactions.filter((trx) => {
    const trxId = `TRX-${String(trx.id).padStart(5, "0")}`;
    return trxId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // FUNGSI UNTUK MENCETAK STRUK
  const printReceipt = () => {
    const printContent = document.getElementById("printable-receipt").innerHTML;
    const printWindow = window.open("", "", "width=400,height=600");
    printWindow.document.write(`
            <html>
                <head>
                    <title>Cetak Struk - Venta POS</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="p-8 flex justify-center bg-gray-200">
                    <div class="w-full max-w-sm bg-white shadow-lg p-6 font-mono text-sm border-t-4 border-gray-800">
                        ${printContent}
                    </div>
                </body>
            </html>
        `);
    printWindow.document.close();
    printWindow.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 800);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans relative">
      {/* --- MODAL STRUK (MUNCUL JIKA ADA TRANSAKSI YANG DI-KLIK) --- */}
      {selectedTrx && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-[scale-up_0.2s_ease-out]">
            {/* Header Modal */}
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">Detail Transaksi</h2>
              <button
                onClick={() => setSelectedTrx(null)}
                className="text-gray-400 hover:text-red-400 text-3xl leading-none transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Konten Struk (Bisa di-scroll jika barangnya banyak) */}
            <div
              className="p-8 overflow-y-auto bg-[#fdfdfd]"
              id="printable-receipt"
            >
              {/* Kop Struk */}
              <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-5">
                <h3 className="text-2xl font-black text-gray-800 tracking-widest mb-1">
                  VENTA POS
                </h3>
                <p className="text-xs text-gray-500 font-semibold">
                  Sistem Kasir Modern Terpercaya
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Jl. Teknologi Cerdas No. 99, Indonesia
                </p>
              </div>

              {/* Info Transaksi */}
              <div className="mb-6 text-sm text-gray-700 font-bold space-y-1">
                <div className="flex justify-between">
                  <span>No. TRX:</span>{" "}
                  <span>#TRX-{String(selectedTrx.id).padStart(5, "0")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>{" "}
                  <span>
                    {new Date(selectedTrx.created_at).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span> <span>Admin / Staff</span>
                </div>
              </div>

              {/* Daftar Barang */}
              <div className="border-t-2 border-b-2 border-dashed border-gray-300 py-4 mb-6 space-y-4">
                {selectedTrx.details && selectedTrx.details.length > 0 ? (
                  selectedTrx.details.map((detail) => {
                    // Mencari harga asli (mencegah error jika barang dihapus)
                    const price =
                      detail.price_at_transaction ||
                      (detail.product ? detail.product.price : 0);
                    const subTotal = price * detail.quantity;
                    const productName = detail.product
                      ? detail.product.name
                      : "Produk telah dihapus";

                    return (
                      <div
                        key={detail.id}
                        className="flex justify-between items-start text-sm text-gray-800"
                      >
                        <div className="flex-1 pr-4">
                          <p className="font-bold">{productName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {detail.quantity} x Rp {price.toLocaleString()}
                          </p>
                        </div>
                        <p className="font-extrabold text-right">
                          Rp {subTotal.toLocaleString()}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-gray-400 italic">
                    Tidak ada detail barang untuk transaksi lama ini.
                  </p>
                )}
              </div>

              {/* Total Pembayaran */}
              <div className="flex justify-between items-center text-xl font-black text-gray-900 mb-8">
                <span>TOTAL</span>
                <span>Rp {selectedTrx.total_amount?.toLocaleString()}</span>
              </div>

              {/* Footer Struk */}
              <div className="text-center mt-4 text-xs font-bold text-gray-500">
                <p>TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
                <p className="font-normal mt-1">
                  Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.
                </p>
              </div>
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="p-5 bg-gray-50 flex gap-3 border-t border-gray-200">
              <button
                onClick={printReceipt}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span className="text-xl">🖨️</span> Cetak Struk
              </button>
              <button
                onClick={() => setSelectedTrx(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- AKHIR MODAL STRUK --- */}

      {/* SIDEBAR ADMIN */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-slate-800 text-center">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 tracking-wide">
            Admin Panel
          </h2>
        </div>
        <nav className="flex flex-col flex-1 p-4 space-y-2 mt-4">
          <Link
            to="/admin"
            className="px-4 py-3 rounded-xl transition-all font-semibold text-slate-400 hover:bg-slate-800 hover:text-white flex items-center gap-3"
          >
            📊 Dashboard
          </Link>
          <Link
            to="/admin/products"
            className="px-4 py-3 rounded-xl transition-all font-semibold text-slate-400 hover:bg-slate-800 hover:text-white flex items-center gap-3"
          >
            📦 Kelola Produk
          </Link>
          <Link
            to="/admin/transactions"
            className="px-4 py-3 rounded-xl transition-all font-semibold text-white bg-blue-600 shadow-md shadow-blue-500/30 flex items-center gap-3"
          >
            🧾 Riwayat Transaksi
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-3 mb-2">
          <Link
            to="/pos"
            className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all font-bold gap-2"
          >
            💻 Buka Kasir
          </Link>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 text-red-400 p-3 rounded-xl flex items-center justify-center font-bold hover:bg-red-500 hover:text-white transition-all gap-2"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">
          Riwayat Transaksi Penjualan
        </h1>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">
            Semua Transaksi ({filteredTransactions.length})
          </h2>
          <div className="relative w-80">
            <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Cari ID Transaksi (Contoh: 12)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-2 border-gray-200 p-3 pl-12 rounded-xl focus:outline-none focus:border-blue-500 bg-white shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-200 text-sm uppercase tracking-wider">
                <th className="p-5 font-bold">ID Transaksi</th>
                <th className="p-5 font-bold">Tanggal & Waktu</th>
                <th className="p-5 font-bold">Total Belanja</th>
                <th className="p-5 font-bold text-center">Status</th>
                <th className="p-5 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="p-5 text-gray-400 font-mono font-bold">
                      #TRX-{String(trx.id).padStart(5, "0")}
                    </td>
                    <td className="p-5 text-gray-700 font-medium">
                      {new Date(trx.created_at).toLocaleString("id-ID", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-5 font-extrabold text-blue-600 text-lg">
                      Rp {trx.total_amount?.toLocaleString()}
                    </td>
                    <td className="p-5 text-center">
                      <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-xl text-sm font-bold shadow-sm">
                        ✓ Berhasil
                      </span>
                    </td>

                    {/* KOLOM AKSI BARU */}
                    <td className="p-5 text-center">
                      <button
                        onClick={() => setSelectedTrx(trx)}
                        className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 transition-colors text-sm flex items-center justify-center gap-2 mx-auto shadow-md"
                      >
                        🧾 Lihat Struk
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-400">
                    <span className="text-5xl block mb-4">📭</span>
                    <p className="text-lg">
                      Transaksi dengan ID <b>"{searchTerm}"</b> tidak ditemukan.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
