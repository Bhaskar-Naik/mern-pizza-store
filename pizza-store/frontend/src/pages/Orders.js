import React, { useState, useEffect, useRef } from "react";
import { getOrders, cancelOrder } from "../services/orderService";
import { generateBill, getPaymentByOrder } from "../services/paymentService";
import { useToast } from "../context/ToastContext";
import { showConfirm, showAlert } from "../utils/sweetAlertHelpers";

const STATUS_CONFIG = {
  pending: { label: "Pending", bg: "#fff3e0", color: "#e65100", icon: "🕐" },
  accepted: { label: "Accepted", bg: "#e3f2fd", color: "#1565c0", icon: "✅" },
  out_for_delivery: {
    label: "Out for Delivery",
    bg: "#f3e5f5",
    color: "#6a1b9a",
    icon: "🛵",
  },
  delivered: {
    label: "Delivered",
    bg: "#e8f5e9",
    color: "#2e7d32",
    icon: "🎉",
  },
  rejected: { label: "Rejected", bg: "#fce4ec", color: "#c62828", icon: "❌" },
  cancelled: {
    label: "Cancelled",
    bg: "#f5f5f5",
    color: "#616161",
    icon: "🚫",
  },
};

// Map statuses to SweetAlert config
const STATUS_ALERT_CONFIG = {
  accepted:         { title: "Order Accepted",      type: "success" },
  rejected:         { title: "Order Rejected",      type: "error"   },
  out_for_delivery: { title: "Out for Delivery",    type: "info"    },
  delivered:        { title: "Order Delivered",     type: "success" },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [bill, setBill] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const { showToast } = useToast();

  // Track previous statuses to detect changes across polls
  const prevStatusesRef = useRef(null);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Refresh every 30 seconds to get latest status
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      const orderList = res.data.data;

      // Detect status changes and fire SweetAlerts (skip very first load)
      if (!isFirstLoadRef.current && prevStatusesRef.current) {
        const prevMap = prevStatusesRef.current;
        orderList.forEach((order) => {
          const prevStatus = prevMap[order._id];
          const newStatus  = order.orderStatus;
          if (prevStatus && prevStatus !== newStatus && STATUS_ALERT_CONFIG[newStatus]) {
            const { title, type } = STATUS_ALERT_CONFIG[newStatus];
            showAlert(title, `Your order #${order._id.slice(-8).toUpperCase()} status updated.`, type);
          }
        });
      }

      // Build new status map and mark first load done
      const newStatusMap = {};
      orderList.forEach((o) => { newStatusMap[o._id] = o.orderStatus; });
      prevStatusesRef.current = newStatusMap;
      if (isFirstLoadRef.current) isFirstLoadRef.current = false;

      setOrders(orderList);

      const paymentMap = {};
      await Promise.all(
        orderList.map(async (order) => {
          try {
            const pRes = await getPaymentByOrder(order._id);
            paymentMap[order._id] = pRes.data.data.paymentStatus;
          } catch (err) {
            paymentMap[order._id] = "pending";
          }
        }),
      );
      setPayments(paymentMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    await fetchOrders();
    showToast("Orders refreshed successfully", "success");
  };

  const handleCancel = async (orderId) => {
    if (!(await showConfirm("Cancel Order", "Are you sure you want to cancel this order?", "error"))) return;
    try {
      await cancelOrder(orderId);
      fetchOrders();
    } catch (err) {
      showToast(
        err.response && err.response.data
          ? err.response.data.message
          : "Cannot cancel order",
        "error",
      );
    }
  };

  const handleViewBill = async (orderId) => {
    try {
      const res = await generateBill(orderId);
      setBill(res.data.data);
      setShowBill(true);
    } catch (err) {
      showToast("Bill not available yet", "error");
    }
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const filtered =
    activeTab === "all"
      ? orders
      : orders.filter((o) => o.orderStatus === activeTab);

  if (loading)
    return (
      <div className="text-center mt-5 pt-5">
        <div className="spinner-border text-danger"></div>
      </div>
    );
  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '40px' }}>
      
      {/* Header */}
      <div style={{ background: '#0b9d3b', color: 'white', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-0">MY ORDERS</h2>
            <p className="mb-0" style={{ opacity: 0.85, fontSize: '14px' }}>
              Track and manage your pizza orders
            </p>
          </div>
          <button 
            className="btn btn-sm rounded-pill fw-bold" 
            onClick={handleManualRefresh}
            style={{ background: 'white', color: '#0b9d3b', border: 'none', padding: '8px 20px', fontSize: '14px' }}
          >
            🔄 REFRESH
          </button>
        </div>
      </div>

      <div className="container mt-4">
        
        {/* Status Filter Tabs */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="d-flex bg-light p-1 overflow-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="btn btn-sm flex-grow-1 rounded-pill py-2 fw-bold text-uppercase"
                style={{
                  fontSize: '11px',
                  background: activeTab === tab.key ? '#006491' : 'transparent',
                  color: activeTab === tab.key ? 'white' : '#666',
                  border: 'none',
                  minWidth: '100px',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm">
            <div style={{ fontSize: "4rem" }}>📦</div>
            <h5 className="fw-bold mt-3 text-dark">No orders found</h5>
            <p className="text-muted small">You don't have any orders in this category.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
              const paymentStatus = payments[order._id] || 'pending';
              
              return (
                <div key={order._id} className="card border-0 shadow-sm rounded-4 overflow-hidden border-start border-4" style={{ borderColor: cfg.color }}>
                  <div className="card-body p-0">
                    <div className="d-flex flex-column flex-md-row">
                      
                      {/* Order Info */}
                      <div className="p-4" style={{ flex: '1', background: '#fff' }}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <span className="badge px-3 py-2 rounded-pill mb-2" style={{ background: cfg.bg, color: cfg.color, fontSize: '11px' }}>
                              {cfg.icon} {cfg.label.toUpperCase()}
                            </span>
                            <div className="text-muted x-small fw-bold">ORDER #{order._id.slice(-8).toUpperCase()}</div>
                          </div>
                          <div className="text-end">
                            <p className="fw-bold text-danger mb-0 h5">₹{order.totalAmount}</p>
                            <p className="text-muted small mb-0">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-light p-3 rounded-3 mb-3">
                          <p className="x-small text-muted fw-bold mb-2">ITEMS</p>
                          <div className="small">
                            {order.items.map((i, idx) => (
                              <div key={idx} className="d-flex justify-content-between mb-1">
                                <span>{i.name} x {i.quantity}</span>
                                <span className="text-muted">₹{i.price * i.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <span className="x-small text-muted fw-bold">PAYMENT:</span>
                          <span className={`badge rounded-pill x-small ${paymentStatus === 'completed' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                            {paymentStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4 bg-light border-start d-flex flex-column justify-content-center gap-2" style={{ minWidth: '200px' }}>
                        <button 
                          className="btn btn-outline-dark btn-sm rounded-pill fw-bold" 
                          onClick={() => handleViewBill(order._id)}
                        >
                          VIEW INVOICE
                        </button>
                        {order.orderStatus === 'pending' && (
                          <button 
                            className="btn btn-outline-danger btn-sm rounded-pill fw-bold"
                            onClick={() => handleCancel(order._id)}
                          >
                            CANCEL ORDER
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bill Modal */}
      {showBill && bill && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowBill(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "30px",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowBill(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "1.4rem",
                cursor: "pointer",
                color: "#999",
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <div style={{ fontSize: "2.5rem" }}>🍕</div>
              <h5 className="fw-bold mt-1" style={{ color: "#E31837" }}>
                Pizza Store
              </h5>
              <p className="text-muted small mb-0">
                Tax Invoice / Bill of Supply
              </p>
            </div>

            {/* Bill Info */}
            <div
              className="d-flex justify-content-between mb-3"
              style={{ fontSize: "13px" }}
            >
              <div>
                <p className="mb-1">
                  <strong>Bill No:</strong> {bill.billNumber}
                </p>
                <p className="mb-0">
                  <strong>Date:</strong> {bill.date}
                </p>
              </div>
              <div className="text-end">
                <p className="mb-1">
                  <strong>Delivery:</strong> {bill.deliveryMode}
                </p>
                <p className="mb-0">
                  <span
                    className="badge rounded-pill"
                    style={{ background: "#e8f5e9", color: "#2e7d32" }}
                  >
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
                {bill.customer.name} | {bill.customer.email} |{" "}
                {bill.customer.phone}
              </p>
            </div>

            <hr />

            {/* Items Table */}
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
              <span
                className="fw-bold"
                style={{ fontSize: "1.2rem", color: "#E31837" }}
              >
                ₹{bill.totalAmount}
              </span>
            </div>

            {/* Payment */}
            {bill.payment && (
              <div
                className="mt-3 p-3 rounded"
                style={{ background: "#f9f9f9", fontSize: "13px" }}
              >
                <p className="mb-1">
                  <strong>Payment Mode:</strong> {bill.payment.mode}
                </p>
                <p className="mb-0">
                  <strong>Payment Status:</strong> {bill.payment.status}
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

export default Orders;
