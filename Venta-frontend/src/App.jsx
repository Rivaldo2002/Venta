import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import PosPage from "./pages/PosPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminTransactions from "./pages/AdminTransactions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/pos" element={<PosPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route
          path="/admin/transactions"
          element={<AdminTransactions />}
        />{" "}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
