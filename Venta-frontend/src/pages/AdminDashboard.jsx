import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api/axios";
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const [report, setReport] = useState({
    total_revenue: 0,
    total_transactions: 0,
    best_sellers: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      Swal.fire({
        icon: "error",
        title: "Akses Ditolak",
        text: "Hanya Admin yang boleh masuk ke halaman ini!",
      });
      navigate("/pos");
    } else {
      fetchReports();
    }
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get("/reports");
      setReport(response.data);
    } catch (error) {
      console.error("Gagal mengambil laporan", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* SIDEBAR ADMIN MODERN TEMA GELAP */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-slate-800 text-center">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 tracking-wide">
            Admin Panel
          </h2>
        </div>

        <nav className="flex flex-col flex-1 p-4 space-y-2 mt-4">
          {/* MENU AKTIF */}
          <Link
            to="/admin"
            className="px-4 py-3 rounded-xl transition-all font-semibold text-white bg-blue-600 shadow-md shadow-blue-500/30 flex items-center gap-3"
          >
            📊 Dashboard
          </Link>
          {/* MENU TIDAK AKTIF */}
          <Link
            to="/admin/products"
            className="px-4 py-3 rounded-xl transition-all font-semibold text-slate-400 hover:bg-slate-800 hover:text-white flex items-center gap-3"
          >
            📦 Kelola Produk
          </Link>
          <Link
            to="/admin/transactions"
            className="px-4 py-3 rounded-xl transition-all font-semibold text-slate-400 hover:bg-slate-800 hover:text-white flex items-center gap-3"
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">
            Laporan Penjualan
          </h1>
          <Link
            to="/admin/products"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
          >
            <span className="text-xl leading-none">+</span> Tambah Produk Baru
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="p-4 bg-green-100 text-green-600 rounded-xl text-3xl">
              💰
            </div>
            <div>
              <h3 className="text-gray-500 font-medium">Total Pendapatan</h3>
              <p className="text-3xl font-extrabold text-gray-800">
                Rp {report.total_revenue.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-xl text-3xl">
              🧾
            </div>
            <div>
              <h3 className="text-gray-500 font-medium">Total Transaksi</h3>
              <p className="text-3xl font-extrabold text-gray-800">
                {report.total_transactions} Trx
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Analisis Performa Produk (Top 5 Laris)
          </h3>
          <div className="h-80">
            {report.best_sellers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.best_sellers}>
                  <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    cursor={{ fill: "#f3f4f6" }}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="total_sold"
                    fill="#3b82f6"
                    name="Jumlah Terjual"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-gray-400">
                <span className="text-4xl mb-2">📊</span>
                <p>Belum ada data transaksi untuk ditampilkan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
