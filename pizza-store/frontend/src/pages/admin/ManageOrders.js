import React, { useState, useEffect } from "react";
import { getOrders, updateOrderStatus, deleteOrder } from "../../services/orderService";
import { generateBill } from "../../services/paymentService";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { showConfirm } from "../../utils/sweetAlertHelpers";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageData, setMessageData] = useState({
    orderId: "",
    userId: "",
    message: "",
  });
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [bill, setBill] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, { orderStatus: status });
      const res = await getOrders();
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
      showToast("Error updating order status", "error");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!(await showConfirm("Delete Order", "Delete this delivered order permanently?", "error"))) return;
    try {
      await deleteOrder(orderId);
      const res = await getOrders();
      setOrders(res.data.data);
      showToast('Order deleted!', 'success');
    } catch (err) {
      showToast('Failed to delete order', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendingMessage(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/messages`, messageData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      showToast("Message sent to customer!", "success");
      setShowMessageForm(false);
      setMessageData({ orderId: "", userId: "", message: "" });
    } catch (err) {
      showToast("Error sending message", "error");
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: { color: "#ff9800", bg: "#fff3e0", label: "Pending" },
      accepted: { color: "#2196f3", bg: "#e3f2fd", label: "Accepted" },
      out_for_delivery: {
        color: "#9c27b0",
        bg: "#f3e5f5",
        label: "Out for Delivery",
      },
      delivered: { color: "#4caf50", bg: "#e8f5e9", label: "Delivered" },
      rejected: { color: "#f44336", bg: "#ffebee", label: "Rejected" },
      cancelled: { color: "#9e9e9e", bg: "#f5f5f5", label: "Cancelled" },
    };
    return config[status] || { color: "#9e9e9e", bg: "#f5f5f5", label: status };
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.orderStatus === filterStatus);

  const getCount = (status) =>
    orders.filter((o) => o.orderStatus === status).length;

  if (loading)
    return (
      <div className="text-center mt-5">
        <div
          className="spinner-border text-danger"
          style={{ width: "3rem", height: "3rem" }}
        ></div>
        <p className="mt-3 text-muted">Loading orders...</p>
      </div>
    );

  return (
    <div style={{ background: "#e8f2fb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: '#0b9d3b', color: 'white', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container">
          <h2 className="fw-bold mb-0">Manage Orders</h2>
          <p className="mb-0" style={{ opacity: 0.85, fontSize: '14px' }}>
            Accept, reject, and track customer orders
          </p>
        </div>
      </div>

      <div className="container py-4">
        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total", value: orders.length, color: "#1a1a2e" },
            { label: "Pending", value: getCount("pending"), color: "#ff9800" },
            {
              label: "Accepted",
              value: getCount("accepted"),
              color: "#2196f3",
            },
            {
              label: "Out for Delivery",
              value: getCount("out_for_delivery"),
              color: "#9c27b0",
            },
            {
              label: "Delivered",
              value: getCount("delivered"),
              color: "#4caf50",
            },
            {
              label: "Rejected",
              value: getCount("rejected"),
              color: "#f44336",
            },
          ].map((stat, i) => (
            <div key={i} className="col-6 col-md-2">
              <div
                className="card border-0 shadow-sm text-center"
                style={{
                  borderRadius: "12px",
                  borderTop: `4px solid ${stat.color}`,
                }}
              >
                <div className="card-body py-3 px-2">
                  <h3 className="fw-bold mb-0" style={{ color: stat.color }}>
                    {stat.value}
                  </h3>
                  <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Send Message Form */}
        {showMessageForm && (
          <div
            className="card border-0 shadow-sm mb-4"
            style={{ borderRadius: "16px", borderLeft: "4px solid #E31837" }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Send Message to Customer</h5>
              <form onSubmit={handleSendMessage}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Message</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="e.g. Your order has been accepted and is being prepared!"
                    value={messageData.message}
                    onChange={(e) =>
                      setMessageData({
                        ...messageData,
                        message: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn rounded-pill px-4"
                    style={{
                      background: "#1a1a2e",
                      color: "#f5deb3",
                      border: "none",
                    }}
                    disabled={sendingMessage}
                  >
                    {sendingMessage ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => {
                      setShowMessageForm(false);
                      setMessageData({ orderId: "", userId: "", message: "" });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {[
            { key: "all", label: "All Orders" },
            { key: "pending", label: "Pending" },
            { key: "accepted", label: "Accepted" },
            { key: "out_for_delivery", label: "Out for Delivery" },
            { key: "delivered", label: "Delivered" },
            { key: "rejected", label: "Rejected" },
            { key: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              className="btn btn-sm rounded-pill px-3"
              style={{
                background: filterStatus === tab.key ? "#1a1a2e" : "white",
                color: filterStatus === tab.key ? "#f5deb3" : "#1a1a2e",
                border: "1px solid #1a1a2e",
              }}
              onClick={() => setFilterStatus(tab.key)}
            >
              {tab.label}
              {tab.key !== "all" && (
                <span
                  className="ms-1"
                  style={{
                    background:
                      filterStatus === tab.key
                        ? "rgba(245,222,179,0.3)"
                        : "#e8f2fb",
                    borderRadius: "10px",
                    padding: "0 6px",
                    fontSize: "11px",
                  }}
                >
                  {getCount(tab.key)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-5">
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop"
              alt="No orders"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "50%",
                opacity: 0.4,
              }}
            />
            <h5 className="text-muted mt-3">No orders found!</h5>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.orderStatus);
            return (
              <div
                key={order._id}
                className="card border-0 shadow-sm mb-4"
                style={{ borderRadius: "16px" }}
              >
                <div className="card-body p-4">
                  {/* Order Header */}
                  <div
                    className="d-flex justify-content-between
                    align-items-start flex-wrap gap-2 mb-3"
                  >
                    <div>
                      <h6 className="fw-bold mb-1">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h6>
                      <p className="text-muted small mb-0">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className="badge rounded-pill px-3 py-2"
                      style={{
                        background: statusConfig.bg,
                        color: statusConfig.color,
                        border: `1px solid ${statusConfig.color}`,
                        fontSize: "13px",
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="row g-3">
                    {/* Customer Info */}
                    <div className="col-md-4">
                      <div
                        className="p-3"
                        style={{ background: "#f8f9fa", borderRadius: "12px" }}
                      >
                        <p className="text-muted small mb-1 fw-semibold">
                          CUSTOMER
                        </p>
                        <p className="fw-bold mb-1">
                          {order.userId?.name || "N/A"}
                        </p>
                        <p className="text-muted small mb-1">
                          {order.userId?.email}
                        </p>
                        <p className="text-muted small mb-0">
                          {order.userId?.phone}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="col-md-4">
                      <div
                        className="p-3"
                        style={{ background: "#f8f9fa", borderRadius: "12px" }}
                      >
                        <p className="text-muted small mb-1 fw-semibold">
                          ITEMS
                        </p>
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="d-flex justify-content-between"
                          >
                            <span className="small">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="small fw-semibold">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between">
                          <strong className="small">Total</strong>
                          <strong className="text-danger small">
                            ₹{order.totalAmount}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="col-md-4">
                      <div
                        className="p-3"
                        style={{ background: "#f8f9fa", borderRadius: "12px" }}
                      >
                        <p className="text-muted small mb-1 fw-semibold">
                          DELIVERY INFO
                        </p>
                        <p className="small mb-1">
                          <strong>Mode:</strong> {order.deliveryMode}
                        </p>
                        {order.addressId && (
                          <p className="small mb-0 text-muted">
                            {order.addressId.houseNumber},{" "}
                            {order.addressId.street}, {order.addressId.city},{" "}
                            {order.addressId.state} - {order.addressId.pincode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="d-flex flex-wrap gap-2 mt-3 pt-3"
                    style={{ borderTop: "1px solid #f0f0f0" }}
                  >
                    {/* pending → Accept / Reject */}
                    {order.orderStatus === "pending" && (
                      <>
                        <button
                          className="btn btn-sm rounded-pill px-3"
                          style={{
                            background: "#4caf50",
                            color: "white",
                            border: "none",
                          }}
                          onClick={() =>
                            handleStatusUpdate(order._id, "accepted")
                          }
                        >
                          Accept Order
                        </button>
                        <button
                          className="btn btn-sm rounded-pill px-3"
                          style={{
                            background: "#f44336",
                            color: "white",
                            border: "none",
                          }}
                          onClick={() =>
                            handleStatusUpdate(order._id, "rejected")
                          }
                        >
                          Reject Order
                        </button>
                      </>
                    )}

                    {/* accepted → Out for Delivery */}
                    {order.orderStatus === "accepted" && (
                      <button
                        className="btn btn-sm rounded-pill px-3"
                        style={{
                          background: "#9c27b0",
                          color: "white",
                          border: "none",
                        }}
                        onClick={() =>
                          handleStatusUpdate(order._id, "out_for_delivery")
                        }
                      >
                        Out for Delivery
                      </button>
                    )}

                    {/* out_for_delivery → Mark Delivered */}
                    {order.orderStatus === "out_for_delivery" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          handleStatusUpdate(order._id, "delivered")
                        }
                      >
                        Mark Delivered
                      </button>
                    )}

                    {/* Send Message — always visible */}
                    <button
                      className="btn btn-sm rounded-pill px-3"
                      style={{
                        background: "white",
                        color: "#1a1a2e",
                        border: "1px solid #1a1a2e",
                      }}
                      onClick={() => {
                        setMessageData({
                          orderId: order._id,
                          userId: order.userId?._id,
                          message: "",
                        });
                        setShowMessageForm(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Send Message
                    </button>

                    {/* Generate Bill */}
                    <button
                      className="btn btn-sm rounded-pill px-3"
                      style={{ background: "#006491", color: "white", border: "none" }}
                      onClick={async () => {
                        try {
                          const res = await generateBill(order._id);
                          setBill(res.data.data);
                          setShowBill(true);
                        } catch (err) {
                          showToast("Failed to generate bill. Make sure payment exists for this order.", "error");
                        }
                      }}
                    >
                      Generate Bill
                    </button>

                    {order.orderStatus === "delivered" && (
                      <button
                        className="btn btn-sm rounded-pill px-3"
                        style={{ background: "#f44336", color: "white", border: "none" }}
                        onClick={() => handleDeleteOrder(order._id)}
                      >
                        🗑️ Delete Order
                      </button>
                    )}

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bill Modal */}
      {showBill && bill && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowBill(false)}
        >
          <div
            style={{
              background: "white", borderRadius: "16px", padding: "30px",
              maxWidth: "520px", width: "100%", maxHeight: "85vh",
              overflowY: "auto", position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button onClick={() => setShowBill(false)} style={{
              position: "absolute", top: "16px", right: "16px",
              background: "none", border: "none", fontSize: "1.4rem",
              cursor: "pointer", color: "#999",
            }}>✕</button>

            {/* Header */}
            <div className="text-center mb-4">
              <div style={{ fontSize: "2.5rem" }}>🍕</div>
              <h5 className="fw-bold mt-1" style={{ color: "#E31837" }}>Pizza Store</h5>
              <p className="text-muted small mb-0">Tax Invoice / Bill of Supply</p>
            </div>

            {/* Bill Info */}
            <div className="d-flex justify-content-between mb-3" style={{ fontSize: "13px" }}>
              <div>
                <p className="mb-1"><strong>Bill No:</strong> {bill.billNumber}</p>
                <p className="mb-0"><strong>Date:</strong> {bill.date}</p>
              </div>
              <div className="text-end">
                <p className="mb-1"><strong>Delivery:</strong> {bill.deliveryMode}</p>
                <p className="mb-0">
                  <span className="badge rounded-pill"
                    style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                    {bill.orderStatus}
                  </span>
                </p>
              </div>
            </div>

            <hr />

            {/* Customer */}
            <div className="mb-3" style={{ fontSize: "13px" }}>
              <p className="fw-semibold mb-1">Customer Details</p>
              <p className="mb-0 text-muted">
                {bill.customer.name} | {bill.customer.email} | {bill.customer.phone}
              </p>
            </div>

            <hr />

            {/* Items */}
            <table className="table table-sm mb-0">
              <thead style={{ background: "#f5f5f5" }}>
                <tr style={{ fontSize: "12px" }}>
                  <th>Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, i) => (
                  <tr key={i} style={{ fontSize: "13px" }}>
                    <td>{item.name}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">₹{item.price}</td>
                    <td className="text-end">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr />

            {/* Total */}
            <div className="d-flex justify-content-between align-items-center mt-2">
              <span className="fw-bold">Total Amount</span>
              <span className="fw-bold" style={{ fontSize: "1.2rem", color: "#E31837" }}>
                ₹{bill.totalAmount}
              </span>
            </div>

            {/* Payment */}
            {bill.payment && (
              <div className="mt-3 p-3 rounded" style={{ background: "#f9f9f9", fontSize: "13px" }}>
                <p className="mb-1"><strong>Payment Mode:</strong> {bill.payment.mode}</p>
                <p className="mb-0">
                  <strong>Payment Status:</strong>{" "}
                  <span style={{
                    color: bill.payment.status === "completed" ? "#2e7d32" : bill.payment.status === "cancelled" ? "#c62828" : "#e65100",
                    fontWeight: "600",
                  }}>
                    {bill.payment.status === "completed" ? "✅ Paid" : bill.payment.status === "cancelled" ? "❌ Cancelled" : "⏳ Pending"}
                  </span>
                </p>
              </div>
            )}

            <button
              className="btn btn-danger w-100 rounded-pill mt-4"
              onClick={() => setShowBill(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


export default ManageOrders;
