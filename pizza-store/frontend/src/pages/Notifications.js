import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const STATUS_CONFIG = {
  delivered:        { color: '#2e7d32', bg: '#e8f5e9', icon: '🎉', label: 'DELIVERED' },
  out_for_delivery: { color: '#6a1b9a', bg: '#f3e5f5', icon: '🛵', label: 'OUT FOR DELIVERY' },
  accepted:         { color: '#1565c0', bg: '#e3f2fd', icon: '✅', label: 'ACCEPTED' },
  rejected:         { color: '#c62828', bg: '#fce4ec', icon: '❌', label: 'REJECTED' },
  cancelled:        { color: '#616161', bg: '#f5f5f5', icon: '🚫', label: 'CANCELLED' },
  pending:          { color: '#e65100', bg: '#fff3e0', icon: '🕐', label: 'PENDING' },
  offer:            { color: '#e65100', bg: '#fff8e1', icon: '🎟️', label: 'OFFER' },
};

const Notifications = () => {
  const [messages, setMessages] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const headers = {
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
  };

  const fetchMessages = useCallback(async () => {
    try {
      const [msgRes, offerRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/messages`, headers),
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/coupons`, headers),
      ]);
      setMessages(msgRes.data.data);
      setOffers(offerRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 15 seconds for new notifications
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const markRead = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/messages/${id}/read`, {}, headers);
      setMessages(prev =>
        prev.map(m => m._id === id ? { ...m, isRead: true } : m)
      );
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      const unread = messages.filter(m => !m.isRead);
      await Promise.all(
        unread.map(m =>
          axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/messages/${m._id}/read`, {}, headers)
        )
      );
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const getStatusConfig = (msg) => {
    const text = (msg.message || '').toLowerCase();
    if (text.includes('delivered') && !text.includes('out'))
      return STATUS_CONFIG.delivered;
    if (text.includes('out for delivery'))
      return STATUS_CONFIG.out_for_delivery;
    if (text.includes('accepted'))
      return STATUS_CONFIG.accepted;
    if (text.includes('rejected'))
      return STATUS_CONFIG.rejected;
    if (text.includes('cancelled'))
      return STATUS_CONFIG.cancelled;
    return STATUS_CONFIG.pending;
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  // Build combined notification list for "All" tab
  const offerNotifications = offers.map(c => ({
    _id: 'offer_' + c._id,
    isOffer: true,
    coupon: c,
    createdAt: c.createdAt,
    isRead: true,
  }));

  const allItems = [...messages, ...offerNotifications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const displayItems = activeTab === 'all'
    ? allItems
    : activeTab === 'orders'
    ? messages
    : offerNotifications;

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-danger"></div>
    </div>
  );

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '40px' }}>

      {/* Header */}
      <div style={{ background: '#0b9d3b', color: 'white', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-0">🔔 Notifications</h2>
            <p className="mb-0" style={{ opacity: 0.85, fontSize: '14px' }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'Your order updates and offers'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="btn btn-sm rounded-pill"
              style={{ background: 'white', color: '#0b9d3b', border: 'none', fontSize: '12px', fontWeight: 'bold' }}>
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4">
          {[
            { key: 'all',    label: `All (${allItems.length})` },
            { key: 'orders', label: `Orders (${messages.length})` },
            { key: 'offers', label: `Offers (${offerNotifications.length})` },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="btn btn-sm rounded-pill"
              style={{
                background: activeTab === tab.key ? '#E31837' : 'white',
                color: activeTab === tab.key ? 'white' : '#555',
                border: activeTab === tab.key ? 'none' : '1px solid #ddd',
                fontWeight: activeTab === tab.key ? '600' : '400',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {displayItems.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '4rem' }}>🔔</div>
            <h5 className="text-muted mt-3">No notifications yet</h5>
            <p className="text-muted small">You'll see order updates and offers here.</p>
          </div>
        ) : (
          displayItems.map(item => {
            // Offer card
            if (item.isOffer) {
              const c = item.coupon;
              return (
                <div key={item._id}
                  style={{
                    background: '#fffde7',
                    border: '1px solid #f9a825',
                    borderLeft: '4px solid #f9a825',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}>
                  <div className="d-flex gap-3 align-items-start">
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: '#fff8e1',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
                    }}>🎟️</div>
                    <div style={{ flex: 1 }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <p className="fw-bold mb-1" style={{ fontSize: '14px', color: '#e65100' }}>
                          {c.title}
                        </p>
                        <span className="badge rounded-pill"
                          style={{ background: '#fff3e0', color: '#e65100', fontSize: '11px' }}>
                          {c.discountType === 'percentage'
                            ? `${c.discountValue}% OFF`
                            : `₹${c.discountValue} OFF`}
                        </span>
                      </div>
                      {c.description && (
                        <p className="mb-1 text-muted" style={{ fontSize: '13px' }}>{c.description}</p>
                      )}
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <div style={{
                          background: 'white', border: '2px dashed #f9a825',
                          borderRadius: '6px', padding: '3px 10px',
                          fontFamily: 'monospace', fontWeight: 'bold',
                          fontSize: '13px', color: '#e65100', letterSpacing: '1px',
                        }}>
                          {c.code}
                        </div>
                        {c.expiryDate && (
                          <span style={{ fontSize: '11px', color: '#999' }}>
                            Expires {new Date(c.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Order notification card
            const cfg = getStatusConfig(item);
            const orderId = item.orderId && item.orderId._id
              ? item.orderId._id.slice(-8).toUpperCase()
              : (item.orderId ? item.orderId.toString().slice(-8).toUpperCase() : '');

            return (
              <div key={item._id}
                onClick={() => !item.isRead && markRead(item._id)}
                style={{
                  background: item.isRead ? 'white' : '#fffbf0',
                  border: item.isRead ? '1px solid #eee' : '1px solid #ffd54f',
                  borderLeft: `4px solid ${cfg.color}`,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  cursor: item.isRead ? 'default' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                }}>
                <div className="d-flex gap-3 align-items-start">
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: cfg.bg,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
                  }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <p className="fw-bold mb-1" style={{ fontSize: '14px' }}>
                        #{orderId}
                      </p>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge rounded-pill"
                          style={{ background: cfg.bg, color: cfg.color, fontSize: '11px', padding: '4px 10px' }}>
                          {cfg.label}
                        </span>
                        {!item.isRead && (
                          <div style={{
                            width: '8px', height: '8px',
                            background: '#E31837', borderRadius: '50%',
                          }}></div>
                        )}
                      </div>
                    </div>
                    <p className="mb-1" style={{ fontSize: '13px', color: '#444' }}>
                      {item.message}
                    </p>
                    <p className="mb-0" style={{ fontSize: '11px', color: '#999' }}>
                      {new Date(item.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;