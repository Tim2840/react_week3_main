import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Sparkles,
  LogIn,
  LogOut,
  Mail,
  Lock,
  NotebookPen,
  Trash,
  Plus,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
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

      //儲存token到cookie內
      document.cookie = `hexToken=${token};expires=${new Date(expired)}`;
      axios.defaults.headers.common["Authorization"] = token;
      setIsAuth(true);
      fetchProducts();
      Swal.fire({
        icon: "success",
        title: "登入成功",
        text: "",
        showConfirmButton: true,
        timer: 2050,
        timerProgressBar: true,
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "登入失敗",
        text: `請重新輸入帳號密碼!`,
      });
    }
  };

  const checkLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log(response.data);
      setIsAuth(true);
      await fetchProducts();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "驗證失敗!",
        text: `請重新登入!${error.response?.data?.message}`,
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    setIsAuthLoading(true);
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
      checkLogin();
    } else {
      console.log("目前還沒有token!");
      setIsAuthLoading(false);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`,
      );
      console.log("取得商品：", response.data.products);
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

  const openAddProductModal = () => {
    setSelectedProduct({
      category: "",
      content: "",
      description: "",
      id: "",
      imageUrl: "",
      imagesUrl: [],
      is_enabled: 0,
      origin_price: 0,
      price: 0,
      title: "",
      unit: "",
      num: 0,
    });
  };

  const handleModalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleImageChange = (value, index) => {
    setSelectedProduct((prev) => {
      const newImages = [...prev.imagesUrl];
      newImages[index] = value;
      return { ...prev, imagesUrl: newImages };
    });
  };

  const deleteModalImg = () => {
    setSelectedProduct((prevData) => {
      const newImagesUrl = [...prevData.imagesUrl];
      newImagesUrl.pop();
      return { ...prevData, imagesUrl: newImagesUrl };
    });
  };

  const addModalImg = (imgsLength) => {
    if (imgsLength < 5) {
      setSelectedProduct((prevData) => ({
        ...prevData,
        imagesUrl: [...prevData.imagesUrl, ""],
      }));
    } else {
      return;
    }
  };

  const updateProduct = async () => {
    // 判斷是post還是put
    const method = selectedProduct.id ? "put" : "post";
    const url = selectedProduct.id
      ? `${API_BASE}/api/${API_PATH}/admin/product/${selectedProduct.id}`
      : `${API_BASE}/api/${API_PATH}/admin/product`;

    try {
      // 準備要送出的資料，並確保各欄位的輸出格式正確
      const productData = {
        ...selectedProduct,
        origin_price: Number(selectedProduct.origin_price || 0),
        price: Number(selectedProduct.price || 0),
        is_enabled: selectedProduct.is_enabled ? 1 : 0,
        imagesUrl: selectedProduct.imagesUrl
          ? selectedProduct.imagesUrl.filter((url) => url !== "")
          : [],
      };
      const formatProductData = { data: productData };
      const response = await axios[method](url, formatProductData);

      console.log(response);
      Swal.fire({
        icon: "success",
        title: selectedProduct.id ? "更新成功" : "新增成功",
        timer: 1500,
        showConfirmButton: false,
      });
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      const errorMsg = Array.isArray(error.response?.data?.message)
        ? error.response.data.message.join("、")
        : error.response?.data?.message || "操作失敗";
      Swal.fire({
        icon: "error",
        title: selectedProduct.id ? "更新失敗" : "新增失敗",
        text: `請檢查欄位是否正確: ${errorMsg}`,
      });
    }
  };

  const deleteProduct = async (targetId) => {
    try {
      await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${targetId}`,
      );
      fetchProducts();
    } catch (error) {
      const errorMsg = error.response.data.message;
      Swal.fire({
        icon: "error",
        title: "刪除失敗",
        text: `請稍後重試!${errorMsg}`,
      });
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

  if (isAuthLoading) {
    return (
      <div className="container">
        <div className="d-flex justify-content-center align-items-center flex-column vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div>頁面重載中，請稍候...</div>
        </div>
      </div>
    );
  }

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
              <div className="col-12 d-flex justify-content-start align-items-center">
                <h2 className="h3 mb-0 me-3">商品列表</h2>
                <button
                  className="btn-sm btn-action d-flex align-items-center pe-3"
                  onClick={() => openAddProductModal()}
                >
                  <Plus size={16} className="me-1" />
                  新增商品
                </button>
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
                              <th className="col-md-1">類別</th>
                              <th className="col-md-4">商品名稱</th>
                              <th className="col-md-2">原價</th>
                              <th className="col-md-2">售價</th>
                              <th className="col-md-1">是否啟用</th>
                              <th className="col-md-2">編輯 / 刪除</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((product) => {
                              const {
                                id,
                                category,
                                title,
                                origin_price,
                                price,
                                is_enabled,
                              } = product;

                              return (
                                <tr key={id}>
                                  <td className="fw-500">{category}</td>
                                  <td className="fw-500">{title}</td>
                                  <td>NT$ {origin_price}</td>
                                  <td className="text-danger fw-bold">
                                    NT$ {price}
                                  </td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        is_enabled
                                          ? "bg-success"
                                          : "bg-secondary"
                                      }`}
                                      onClick={() => changeProductStatus(id)}
                                    >
                                      {product.is_enabled ? "啟用" : "停用"}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-action btn-sm d-inline-flex align-items-center me-1"
                                      onClick={() =>
                                        setSelectedProduct(product)
                                      }
                                    >
                                      <NotebookPen size={16} className="me-1" />
                                      編輯
                                    </button>
                                    <button
                                      className="btn btn-danger btn-sm d-inline-flex align-items-center"
                                      onClick={() => deleteProduct(id)}
                                    >
                                      <Trash size={16} className="me-1" />
                                      刪除
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
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
            >
              <div className="modal-dialog modal-xl modal-dialog-centered">
                <div
                  className="modal-content"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {selectedProduct.id ? "編輯商品" : "新增商品"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSelectedProduct(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form>
                      <div className="row">
                        <div className="col-md-4">
                          <div className="flex-column mb-3">
                            <label htmlFor="imageUrl" className="form-label">
                              主要圖片
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              id="imageUrl"
                              name="imageUrl"
                              placeholder="請輸入圖片連結"
                              value={selectedProduct.imageUrl}
                              onChange={(e) => handleModalInputChange(e)}
                            />
                          </div>
                          {selectedProduct.imageUrl && (
                            <img
                              src={selectedProduct.imageUrl}
                              className="img-fluid rounded d-block mx-auto"
                              alt={selectedProduct.title}
                              style={{ maxWidth: "200px", maxHeight: "200px" }}
                            />
                          )}
                          {/* 操作圖片 */}
                          <div className="d-flex justify-content-between mt-3 mb-3">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm w-100 me-2"
                              onClick={() =>
                                addModalImg(selectedProduct.imagesUrl.length)
                              }
                            >
                              新增圖片
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm w-100"
                              onClick={() => deleteModalImg()}
                            >
                              刪除圖片
                            </button>
                          </div>
                          {/* 副圖 */}

                          {selectedProduct.imagesUrl.map((url, index) => (
                            <div key={index} className="mb-3">
                              <label className="form-label">
                                副圖 {index + 1}
                              </label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder={`圖片網址 ${index + 1}`}
                                // 副圖的 name 屬性不需要，因為 handleImageChange 已經透過 index 處理
                                value={url}
                                onChange={(e) =>
                                  handleImageChange(e.target.value, index)
                                }
                              />
                              {url && (
                                <img
                                  src={url}
                                  className="img-fluid rounded mt-2 d-block mx-auto"
                                  alt={`副圖 ${index + 1}`}
                                  style={{
                                    maxWidth: "200px",
                                    maxHeight: "200px",
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="col-md-8">
                          <div className="mb-3">
                            <label htmlFor="title" className="form-label">
                              標題
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="title"
                              name="title"
                              placeholder="請輸入標題"
                              value={selectedProduct.title}
                              onChange={(e) => handleModalInputChange(e)}
                            />
                          </div>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="category" className="form-label">
                                分類
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="category"
                                name="category"
                                placeholder="請輸入分類"
                                value={selectedProduct.category}
                                onChange={(e) => handleModalInputChange(e)}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="unit" className="form-label">
                                單位
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="unit"
                                name="unit"
                                placeholder="請輸入單位"
                                value={selectedProduct.unit}
                                onChange={(e) => handleModalInputChange(e)}
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label
                                htmlFor="origin_price"
                                className="form-label"
                              >
                                原價
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="origin_price"
                                name="origin_price"
                                placeholder="請輸入原價"
                                value={selectedProduct.origin_price}
                                onChange={(e) => handleModalInputChange(e)}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="price" className="form-label">
                                售價
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="price"
                                name="price"
                                placeholder="請輸入售價"
                                value={selectedProduct.price}
                                onChange={(e) => handleModalInputChange(e)}
                              />
                            </div>
                          </div>
                          <hr />
                          <div className="mb-3">
                            <label htmlFor="description" className="form-label">
                              產品描述
                            </label>
                            <textarea
                              className="form-control"
                              id="description"
                              rows="2"
                              name="description"
                              placeholder="請輸入產品描述"
                              value={selectedProduct.description}
                              onChange={(e) => handleModalInputChange(e)}
                            ></textarea>
                          </div>
                          <div className="mb-3">
                            <label htmlFor="content" className="form-label">
                              說明內容
                            </label>
                            <textarea
                              className="form-control"
                              id="content"
                              rows="2"
                              name="content"
                              placeholder="請輸入說明內容"
                              value={selectedProduct.content}
                              onChange={(e) => handleModalInputChange(e)}
                            ></textarea>
                          </div>
                          <div className="mb-3">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="is_enabled"
                                name="is_enabled"
                                checked={!!selectedProduct.is_enabled}
                                onChange={(e) => handleModalInputChange(e)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="is_enabled"
                              >
                                是否啟用
                              </label>
                            </div>
                            {JSON.stringify(selectedProduct)}
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setSelectedProduct(null)}
                    >
                      取消
                    </button>
                    <button
                      className="btn btn-action"
                      onClick={() => updateProduct()}
                    >
                      儲存變更
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
