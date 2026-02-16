CREATE TABLE `kategori` (
  `id_kategori` int PRIMARY KEY AUTO_INCREMENT,
  `nama_kategori` varchar(255) NOT NULL
);

CREATE TABLE `barang` (
  `id_barang` int PRIMARY KEY AUTO_INCREMENT,
  `id_kategori` int,
  `nama_barang` varchar(255) NOT NULL,
  `harga_jual` int NOT NULL,
  `stok_saat_ini` int DEFAULT 0
);

CREATE TABLE `users` (
  `id_user` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(255) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) COMMENT 'Admin atau Kasir'
);

CREATE TABLE `pelanggan` (
  `id_pelanggan` int PRIMARY KEY AUTO_INCREMENT,
  `nama_pelanggan` varchar(255),
  `kontak` varchar(255)
);

CREATE TABLE `penjualan` (
  `id_penjualan` int PRIMARY KEY AUTO_INCREMENT,
  `id_user` int,
  `id_pelanggan` int,
  `tanggal_transaksi` timestamp DEFAULT (now()),
  `total_bayar` int
);

CREATE TABLE `detail_penjualan` (
  `id_detail` int PRIMARY KEY AUTO_INCREMENT,
  `id_penjualan` int,
  `id_barang` int,
  `jumlah_beli` int,
  `subtotal` int
);

CREATE TABLE `barang_masuk` (
  `id_masuk` int PRIMARY KEY AUTO_INCREMENT,
  `id_barang` int,
  `jumlah_masuk` int,
  `tanggal_masuk` timestamp DEFAULT (now())
);

ALTER TABLE `barang` ADD FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`);

ALTER TABLE `penjualan` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`);

ALTER TABLE `penjualan` ADD FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id_pelanggan`);

ALTER TABLE `detail_penjualan` ADD FOREIGN KEY (`id_penjualan`) REFERENCES `penjualan` (`id_penjualan`);

ALTER TABLE `detail_penjualan` ADD FOREIGN KEY (`id_barang`) REFERENCES `barang` (`id_barang`);

ALTER TABLE `barang_masuk` ADD FOREIGN KEY (`id_barang`) REFERENCES `barang` (`id_barang`);
