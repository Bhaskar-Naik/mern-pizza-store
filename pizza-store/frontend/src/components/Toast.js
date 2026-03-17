import React, { useEffect } from 'react';

const COLORS = {
  success: { bg: '#e8f5e9', border: '#2e7d32', color: '#2e7d32', icon: '✅' },
  error:   { bg: '#fce4ec', border: '#c62828', color: '#c62828', icon: '❌' },
  info:    { bg: '#e3f2fd', border: '#1565c0', color: '#1565c0', icon: 'ℹ️' },
  blue:    { bg: '#e3f2fd', border: '#1565c0', color: '#1565c0', icon: '🛵' },
  parrot:  { bg: '#f1f8e9', border: '#33691e', color: '#33691e', icon: '🎉' },
};

const Toast = ({ message, type = 'success', onClose }) => {
  const cfg = COLORS[type] || COLORS.success;

  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 99999,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderLeft: `4px solid ${cfg.border}`,
      borderRadius: '10px', padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      minWidth: '280px', maxWidth: '380px',
      animation: 'slideIn 0.2s ease',
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>
      <span style={{ fontSize: '1.2rem' }}>{cfg.icon}</span>
      <span style={{ color: cfg.color, fontWeight: '600', fontSize: '14px', flex: 1 }}>
        {message}
      </span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#999', fontSize: '1rem', padding: '0 4px',
      }}>✕</button>
    </div>
  );
};

export default Toast;