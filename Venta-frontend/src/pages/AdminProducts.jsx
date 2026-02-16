import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", stock: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // STATE BARU: Untuk menyimpan teks pencarian
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Gagal mengambil data produk", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("stock", form.stock);

      if (isEditing) {
        formData.append("_method", "PUT");
        await api.post(`/products/${editId}`, formData);
      } else {
        await api.post("/products", formData);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Diperbarui!" : "Tersimpan!",
        text: isEditing
          ? "Data produk berhasil diubah."
          : "Produk baru berhasil ditambahkan.",
        showConfirmButton: false,
        timer: 1500,
      });

      resetForm();
      fetchProducts();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Pastikan semua isian sudah benar.",
      });
    }
  };

  const handleEdit = (product) => {
    setForm({ name: product.name, price: product.price, stock: product.stock });
    setIsEditing(true);
    setEditId(product.id);
  };

  const resetForm = () => {
    setForm({ name: "", price: "", stock: "" });
    setIsEditing(false);
    setEditId(null);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data produk ini akan hilang permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/products/${id}`);
          Swal.fire("Terhapus!", "Data produk telah dihapus.", "success");
          fetchProducts();
        } catch (error) {
          Swal.fire("Gagal!", "Terjadi kesalahan.", "error");
        }
      }
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // LOGIKA PENCARIAN: Menyaring produk berdasarkan nama (huruf besar/kecil diabaikan)
  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => b.id - a.id);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
      {/* SIDEBAR */}
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
            className="px-4 py-3 rounded-xl transition-all font-semibold text-white bg-blue-600 shadow-md shadow-blue-500/30 flex items-center gap-3"
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
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
          Kelola Inventori Produk
        </h1>

        {/* FORM INPUT BARANG */}
        <div
          className={`p-6 rounded-2xl shadow-sm mb-8 border border-gray-100 ${isEditing ? "bg-yellow-50/50 border-l-4 border-l-yellow-400" : "bg-white"}`}
        >
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {isEditing ? "✏️ Ubah Data Produk" : "✨ Tambah Produk Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Nama Produk
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Harga (Rp)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Jumlah Stok
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className={`${isEditing ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"} text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md`}
              >
                {isEditing ? "Update Data" : "Simpan Produk"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-400 text-white px-6 py-3 rounded-xl hover:bg-gray-500 font-bold transition-all"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* HEADER TABEL DENGAN FITUR SEARCH */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">
            Daftar Produk ({filteredProducts.length})
          </h2>
          <div className="relative w-72">
            <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-2 border-gray-200 p-3 pl-12 rounded-xl focus:outline-none focus:border-blue-500 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* TABEL PRODUK */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-200 text-sm uppercase tracking-wider">
                <th className="p-5 font-bold">ID</th>
                <th className="p-5 font-bold">Nama Produk</th>
                <th className="p-5 font-bold">Harga</th>
                <th className="p-5 font-bold">Sisa Stok</th>
                <th className="p-5 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="p-5 text-gray-400 font-mono">#{p.id}</td>
                    <td className="p-5 font-bold text-gray-800">{p.name}</td>
                    <td className="p-5 font-semibold text-gray-600">
                      Rp {p.price.toLocaleString()}
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm ${p.stock < 10 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-5 text-center space-x-3">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 bg-red-50 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    <span className="text-3xl block mb-2">🤷‍♂️</span>
                    Produk <b>"{searchTerm}"</b> tidak ditemukan.
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
