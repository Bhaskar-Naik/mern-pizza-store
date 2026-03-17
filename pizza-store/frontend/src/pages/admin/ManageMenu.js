import React, { useState, useEffect } from "react";
import { showAlert, showConfirm } from "../../utils/sweetAlertHelpers";
import {
  getMenuItems,
  getCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createCategory,
} from "../../services/menuService";

const ManageMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [newCategory, setNewCategory] = useState("");
  const [showCatForm, setShowCatForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    image: "",
    isAvailable: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        getMenuItems(),
        getCategories(),
      ]);

      const menuData = menuRes?.data?.data || menuRes?.data || [];
      const categoryData = catRes?.data?.data || catRes?.data || [];

      setMenuItems(Array.isArray(menuData) ? menuData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (err) {
      console.error("Fetch error:", err);

      setMenuItems([]);
      setCategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        isAvailable:
          formData.isAvailable === true || formData.isAvailable === "true",
      };

      if (editItem) {
        await updateMenuItem(editItem._id, payload);
      } else {
        await createMenuItem(payload);
      }

      resetForm();
      fetchData();
    } catch (err) {
      showAlert("Error", err?.response?.data?.message || "Error saving item", "error");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditItem(null);

    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      image: "",
      isAvailable: true,
    });
  };

  const handleEdit = (item) => {
    if (!item) return;

    setEditItem(item);

    setFormData({
      name: item?.name || "",
      description: item?.description || "",
      price: item?.price || "",
      categoryId: item?.categoryId?._id || item?.categoryId || "",
      image: item?.image || "",
      isAvailable: item?.isAvailable ?? true,
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!(await showConfirm("Delete Item", "Are you sure you want to delete this menu item?", "error"))) return;

    try {
      await deleteMenuItem(id);
      fetchData();
      showAlert("Success", "Item deleted successfully", "success");
    } catch (err) {
      showAlert("Error", err?.response?.data?.message || "Error deleting item", "error");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategory.trim()) return;

    try {
      await createCategory({ categoryName: newCategory });

      setNewCategory("");
      setShowCatForm(false);

      fetchData();
    } catch (err) {
      showAlert("Error", err?.response?.data?.message || "Error creating category", "error");
    }
  };

  return (
    <div style={{ background: "#e8f2fb", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ background: '#0b9d3b', color: 'white', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-0">Manage Menu</h2>
            <p className="mb-0" style={{ opacity: 0.85, fontSize: '14px' }}>
              Add, edit, and delete menu items
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-sm"
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "white",
                borderRadius: "20px",
                fontWeight: "bold",
                border: "none",
              }}
              onClick={() => setShowCatForm(!showCatForm)}
            >
              + Category
            </button>

            <button
              className="btn btn-sm"
              style={{
                background: "white",
                color: "#0b9d3b",
                borderRadius: "20px",
                fontWeight: "bold",
                border: "none",
              }}
              onClick={() => {
                setEditItem(null);

                setFormData({
                  name: "",
                  description: "",
                  price: "",
                  categoryId: "",
                  image: "",
                  isAvailable: true,
                });

                setShowForm(true);
              }}
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>

      <div className="container py-4">

        {/* CATEGORY FORM */}

        {showCatForm && (
          <div
            className="card mb-4 border-0 shadow-sm"
            style={{ borderRadius: "16px" }}
          >
            <div className="card-body p-3">
              <h6 className="fw-bold mb-3">Add New Category</h6>

              <form onSubmit={handleAddCategory} className="d-flex gap-2">
                <input
                  className="form-control"
                  placeholder="Category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="btn"
                  style={{ background: "#1a1a2e", color: "#f5deb3" }}
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        )}

        {showForm && (
          <div
            className="card mb-4 border-0 shadow-sm"
            style={{ borderRadius: "16px" }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">
                {editItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Item Name</label>
                    <input
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <select
                      className="form-select"
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Category</option>

                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Availability
                    </label>
                    <select
                      className="form-select"
                      value={formData.isAvailable}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isAvailable: e.target.value === "true",
                        })
                      }
                    >
                      <option value="true">Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Image URL</label>
                    <input
                      className="form-control"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn me-2"
                      style={{
                        background: "#1a1a2e",
                        color: "#f5deb3",
                        borderRadius: "20px",
                        padding: "8px 24px",
                      }}
                    >
                      {editItem ? "Update Item" : "Add Item"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setShowForm(false);
                        setEditItem(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MENU TABLE */}

        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "16px" }}
        >
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ background: "#1a1a2e", color: "#f5deb3" }}>
                  <tr>
                    <th className="px-4 py-3">Image</th>
                    <th className="py-3">Name</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {(menuItems || []).map((item) => {
                    const available = item?.isAvailable ?? true;

                    return (
                      <tr key={item._id}>
                        <td className="px-4">
                          <img
                            src={
                              item?.image ||
                              "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100"
                            }
                            alt={item?.name}
                            style={{
                              width: "60px",
                              height: "45px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </td>

                        <td className="fw-semibold">{item?.name}</td>

                        <td>{item?.categoryId?.categoryName || "-"}</td>

                        <td className="text-danger fw-bold">₹{item?.price}</td>

                        <td>
                          <span
                            className={`badge ${available ? "bg-success" : "bg-secondary"}`}
                          >
                            {available ? "Available" : "Unavailable"}
                          </span>
                        </td>

                        <td>
                          <button
                            className="btn btn-sm me-2"
                            style={{
                              background: "#006491",
                              color: "white",
                              borderRadius: "15px",
                            }}
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm"
                            style={{
                              background: "#E31837",
                              color: "white",
                              borderRadius: "15px",
                            }}
                            onClick={() => handleDelete(item._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {menuItems.length === 0 && (
                <div className="text-center py-5 text-muted">
                  No menu items yet. Add your first item!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMenu;
