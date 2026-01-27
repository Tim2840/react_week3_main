import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Sparkles, LogIn, LogOut, Mail, Lock, Eye } from "lucide-react";
import "./assets/style.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log(`${name}:`, value);
  };

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      console.log("送出的資料：", formData);
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      console.log(response);
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)}`;
      axios.defaults.headers.common["Authorization"] = token;
      Swal.fire({
        icon: "success",
        title: "登入成功",
        text: "",
        showConfirmButton: true,
        timer: 2050,
        timerProgressBar: true,
      });
      setIsAuth(true);
      await fetchProducts();
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "登入失敗",
        text: "請重新輸入帳號密碼!",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      axios.defaults.headers.common["Authorization"] = token;
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`,
      );
      console.log("取得商品：", response.data);
      setProducts(response.data.products);
    } catch (error) {
      console.log("取得商品失敗：", error);
      Swal.fire({
        icon: "error",
        title: "取得商品失敗",
        text: "請重新整理頁面",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "hexToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setIsAuth(false);
    setProducts([]);
    setSelectedProduct(null);
    Swal.fire({
      icon: "success",
      title: "登出成功",
      timer: 1500,
    });
  };

  return (
    <>
      {!isAuth ? (
        <main className="login-page">
          <section className="auth-card">
            <header className="auth-header">
              <h2>
                愛哆啦也愛<span className="text-accent">手作</span>
                <Sparkles color="#ff758c" className="me-2" />
              </h2>
              <p>請輸入你的帳號密碼</p>
            </header>
            <form onSubmit={(e) => onSubmit(e)}>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="username"
                  name="username"
                  placeholder="name@example.com"
                  value={formData.username}
                  onChange={(e) => handleInputChange(e)}
                />
                <label htmlFor="username">Email address</label>
                <Mail className="input-icon" size={20} />
              </div>
              <div className="form-floating">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange(e)}
                />
                <label htmlFor="password">Password</label>
                <Lock className="input-icon" size={20} />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 mt-4 d-flex align-items-center justify-content-center"
              >
                <LogIn size={20} className="me-2" /> 登入
              </button>
            </form>
          </section>
        </main>
      ) : (
        <div className="d-flex flex-column min-vh-100 bg-light admin-layout">
          {/* Nav */}
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container-fluid px-4">
              <a
                className="navbar-brand d-flex align-items-center fw-bold"
                href="#"
              >
                <Sparkles color="#ff758c" size={24} className="me-2" />
                後台管理
              </a>
              <button
                className="btn btn-outline-light btn-sm ms-auto d-flex align-items-center"
                onClick={() => handleLogout()}
              >
                <LogOut size={18} className="me-2" />
                登出
              </button>
            </div>
          </nav>

          <main className="container-fluid flex-grow-1 px-4 py-4">
            {/* 標題 */}
            <div className="row mb-4">
              <div className="col-12">
                <h2 className="h3 mb-0">商品列表</h2>
              </div>
            </div>

            {/* 商品列表表格 */}
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    {loading ? (
                      <div className="text-center py-5">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <p className="mb-0">尚無商品</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="product-table table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>商品名稱</th>
                              <th>原價</th>
                              <th>售價</th>
                              <th>是否啟用</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((product) => (
                              <tr key={product.id}>
                                <td className="fw-500">{product.title}</td>
                                <td>NT$ {product.origin_price}</td>
                                <td className="text-danger fw-bold">
                                  NT$ {product.price}
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      product.is_enabled
                                        ? "bg-success"
                                        : "bg-secondary"
                                    }`}
                                  >
                                    {product.is_enabled ? "啟用" : "停用"}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="btn btn-info btn-sm d-inline-flex align-items-center"
                                    onClick={() => setSelectedProduct(product)}
                                  >
                                    <Eye size={16} className="me-1" />
                                    查看詳情
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>

          <footer className="bg-white py-3 border-top mt-5">
            <div className="container-fluid text-center">
              <p className="mb-0 text-muted small">
                &copy; {new Date().getFullYear()} 愛哆啦也愛手作後台管理系統
              </p>
            </div>
          </footer>

          {/* 商品詳細 Modal */}
          {selectedProduct && (
            <div
              className="modal fade show modal-overlay"
              tabIndex="-1"
              onClick={() => setSelectedProduct(null)}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{selectedProduct.title}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSelectedProduct(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {selectedProduct.imageUrl && (
                      <img
                        src={selectedProduct.imageUrl}
                        className="img-fluid rounded mb-3 w-100"
                        alt={selectedProduct.title}
                        style={{ maxHeight: "300px", objectFit: "cover" }}
                      />
                    )}
                    <div className="mb-3">
                      <label className="fw-bold text-muted">商品分類</label>
                      <p>{selectedProduct.content || "未設定"}</p>
                    </div>
                    <div className="mb-3">
                      <label className="fw-bold text-muted">商品描述</label>
                      <p>{selectedProduct.description || "未設定"}</p>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label className="fw-bold text-muted">原價</label>
                        <p className="">NT$ {selectedProduct.origin_price}</p>
                      </div>
                      <div className="col-6">
                        <label className="fw-bold text-muted">售價</label>
                        <p className="">NT$ {selectedProduct.price}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="fw-bold text-muted">是否啟用</label>
                      <p>
                        <span
                          className={`badge ${
                            selectedProduct.is_enabled
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {selectedProduct.is_enabled ? "啟用" : "停用"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setSelectedProduct(null)}
                    >
                      關閉
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
