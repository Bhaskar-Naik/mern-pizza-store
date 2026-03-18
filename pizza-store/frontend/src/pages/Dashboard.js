import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    delivered: 0,
    pending: 0,
    cancelled: 0,
  });
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data?.data || [];
      setOrders(data);
      calculateStats(data);
      calculateTopItems(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderData) => {
    const statsObj = {
      totalOrders: orderData.length,
      totalSpent: 0,
      delivered: 0,
      pending: 0,
      cancelled: 0,
    };

    orderData.forEach((order) => {
      statsObj.totalSpent += order.totalAmount || 0;
      if (order.orderStatus === 'delivered') statsObj.delivered += 1;
      else if (order.orderStatus === 'pending') statsObj.pending += 1;
      else if (order.orderStatus === 'cancelled') statsObj.cancelled += 1;
    });

    setStats(statsObj);
  };

  const calculateTopItems = (orderData) => {
    const itemMap = {};

    orderData.forEach((order) => {
      order.items?.forEach((item) => {
        const key = item.name;
        if (!itemMap[key]) {
          itemMap[key] = {
            name: item.name,
            count: 0,
            totalRevenue: 0,
          };
        }
        itemMap[key].count += item.quantity || 1;
        itemMap[key].totalRevenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    const topItemsArray = Object.values(itemMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopItems(topItemsArray);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      accepted: '#2196f3',
      rejected: '#f44336',
      out_for_delivery: '#4caf50',
      delivered: '#0b9d3b',
      cancelled: '#999',
    };
    return colors[status] || '#999';
  };

  if (loading) {
    return (
      <div style={{ background: '#e8f2fb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#e8f2fb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#07882e', color: 'white', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container">
          <h2 className="fw-bold mb-0">📊 Your Dashboard</h2>
          <p className="mb-0" style={{ opacity: 0.85, fontSize: '14px' }}>
            Welcome back, {user?.name}! Here's your order summary.
          </p>
        </div>
      </div>

      <div className="container py-4">
        {/* Quick Stats Cards */}
        <div className="row g-3 mb-5">
          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: '12px', borderLeft: '4px solid #006491' }}
            >
              <div className="card-body p-3">
                <h6 className="text-muted fw-semibold mb-2" style={{ fontSize: '12px' }}>
                  TOTAL ORDERS
                </h6>
                <h3 className="fw-bold mb-0" style={{ color: '#006491', fontSize: '2rem' }}>
                  {stats.totalOrders}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: '12px', borderLeft: '4px solid #0b9d3b' }}
            >
              <div className="card-body p-3">
                <h6 className="text-muted fw-semibold mb-2" style={{ fontSize: '12px' }}>
                  TOTAL SPENT
                </h6>
                <h3 className="fw-bold mb-0" style={{ color: '#0b9d3b', fontSize: '2rem' }}>
                  ₹{stats.totalSpent.toLocaleString('en-IN')}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: '12px', borderLeft: '4px solid #4caf50' }}
            >
              <div className="card-body p-3">
                <h6 className="text-muted fw-semibold mb-2" style={{ fontSize: '12px' }}>
                  DELIVERED
                </h6>
                <h3 className="fw-bold mb-0" style={{ color: '#4caf50', fontSize: '2rem' }}>
                  {stats.delivered}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: '12px', borderLeft: '4px solid #ff9800' }}
            >
              <div className="card-body p-3">
                <h6 className="text-muted fw-semibold mb-2" style={{ fontSize: '12px' }}>
                  PENDING
                </h6>
                <h3 className="fw-bold mb-0" style={{ color: '#ff9800', fontSize: '2rem' }}>
                  {stats.pending}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="row g-4 mb-5">
          {/* Top Ordered Items */}
          <div className="col-12 col-lg-6">
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: '14px', overflow: 'hidden' }}
            >
              <div
                className="card-header p-3 fw-bold"
                style={{ background: 'linear-gradient(135deg, #006491 0%, #004266 100%)', color: 'white' }}
              >
                🏆 Your Top 5 Favorites
              </div>
              <div className="card-body p-0">
                {topItems.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <p className="mb-0">No orders yet. Start ordering! 🍕</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead style={{ background: '#f5f5f5' }}>
                        <tr>
                          <th style={{ borderTop: 'none' }}>Item</th>
                          <th style={{ borderTop: 'none' }}>Times Ordered</th>
                          <th style={{ borderTop: 'none' }}>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="fw-semibold">{item.name}</td>
                            <td>
                              <span
                                className="badge"
                                style={{ background: '#006491', color: 'white' }}
                              >
                                {item.count}
                              </span>
                            </td>
                            <td>₹{item.totalRevenue.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="col-12 col-lg-6">
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: '14px', overflow: 'hidden' }}
            >
              <div
                className="card-header p-3 fw-bold"
                style={{ background: 'linear-gradient(135deg, #0b9d3b 0%, #077a2a 100%)', color: 'white' }}
              >
                📦 Recent Orders
              </div>
              <div className="card-body p-0">
                {orders.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <p className="mb-0">No orders yet. Start ordering! 🍕</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {orders.slice(0, 5).map((order, idx) => (
                      <div
                        key={order._id}
                        className="p-3"
                        style={{
                          borderBottom: idx !== Math.min(4, orders.length - 1) ? '1px solid #eee' : 'none',
                          background: idx % 2 === 0 ? '#fafafa' : 'white',
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>
                              Order #{order._id?.slice(-6).toUpperCase()}
                            </h6>
                            <p className="mb-1 small text-muted">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <p className="mb-0 small">
                              <strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
                              {' • '}
                              <strong>{order.items?.length}</strong> items
                            </p>
                          </div>
                          <span
                            className="badge"
                            style={{ background: getStatusColor(order.orderStatus), color: 'white' }}
                          >
                            {order.orderStatus?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="row mb-4">
          <div className="col-12">
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: '14px', overflow: 'hidden' }}
            >
              <div
                className="card-header p-3 fw-bold"
                style={{ background: 'linear-gradient(135deg, #e65100 0%, #bf360c 100%)', color: 'white' }}
              >
                📈 Order Status Breakdown
              </div>
              <div className="card-body p-4">
                <div className="row text-center g-3">
                  <div className="col-12 col-sm-6 col-lg-3">
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: '#0b9d3b' }}>
                        {stats.delivered}
                      </h4>
                      <p className="text-muted small mb-0">✅ Delivered</p>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-lg-3">
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: '#ff9800' }}>
                        {stats.pending}
                      </h4>
                      <p className="text-muted small mb-0">⏳ Pending</p>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-lg-3">
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: '#f44336' }}>
                        {stats.cancelled}
                      </h4>
                      <p className="text-muted small mb-0">❌ Cancelled</p>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-lg-3">
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: '#2196f3' }}>
                        {stats.totalOrders - stats.delivered - stats.pending - stats.cancelled}
                      </h4>
                      <p className="text-muted small mb-0">📋 Other</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="mt-4" style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                  <p className="fw-semibold mb-3" style={{ color: '#1a1a2e', fontSize: '14px' }}>
                    Order Status Distribution
                  </p>
                  {[
                    { label: 'Delivered', count: stats.delivered, color: '#0b9d3b' },
                    { label: 'Pending', count: stats.pending, color: '#ff9800' },
                    { label: 'Cancelled', count: stats.cancelled, color: '#f44336' },
                  ].map(
                    (item) =>
                      stats.totalOrders > 0 && (
                        <div key={item.label} className="mb-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="fw-semibold">{item.label}</small>
                            <small className="text-muted">
                              {((item.count / stats.totalOrders) * 100).toFixed(1)}%
                            </small>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div
                              className="progress-bar"
                              style={{
                                width: `${(item.count / stats.totalOrders) * 100}%`,
                                background: item.color,
                              }}
                            />
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
