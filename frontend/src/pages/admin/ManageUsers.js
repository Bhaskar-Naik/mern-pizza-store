import React, { useState, useEffect } from 'react';
import { getAllUsers, makeUserAdmin, removeUserAdmin } from '../../services/authService';
import Swal from 'sweetalert2';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const MAIN_ADMIN_EMAIL = 'baachin22@gmail.com';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMakeAdmin = async (user) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `You want to make <b>${user.name}</b> an Admin?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0b9d3b',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Make Admin!',
      cancelButtonText: 'Cancel',
      background: '#1a1a2e',
      color: '#fff',
    });

    if (result.isConfirmed) {
      try {
        const res = await makeUserAdmin(user._id);
        Swal.fire({
          title: 'Success!',
          text: res.data.message,
          icon: 'success',
          confirmButtonColor: '#0b9d3b',
          background: '#1a1a2e',
          color: '#fff',
          timer: 3000,
          timerProgressBar: true,
        });
        fetchUsers(); // Refresh list
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.response?.data?.message || 'Failed to make admin',
          icon: 'error',
          confirmButtonColor: '#d33',
          background: '#1a1a2e',
          color: '#fff',
        });
      }
    }
  };

  const handleRemoveAdmin = async (user) => {
    const result = await Swal.fire({
      title: 'Remove Admin Rights?',
      html: `Are you sure you want to demote <b>${user.name}</b> back to a Customer?`,
      icon: 'caution',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Remove Admin',
      cancelButtonText: 'Cancel',
      background: '#1a1a2e',
      color: '#fff',
    });

    if (result.isConfirmed) {
      try {
        const res = await removeUserAdmin(user._id);
        Swal.fire({
          title: 'Removed!',
          text: res.data.message,
          icon: 'info',
          confirmButtonColor: '#006491',
          background: '#1a1a2e',
          color: '#fff',
          timer: 3000,
          timerProgressBar: true,
        });
        fetchUsers(); // Refresh list
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.response?.data?.message || 'Failed to remove admin',
          icon: 'error',
          confirmButtonColor: '#d33',
          background: '#1a1a2e',
          color: '#fff',
        });
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div
        style={{
          background: '#0b9d3b',
          padding: '24px 30px',
          color: 'white',
          borderBottom: '3px solid #087d2f',
        }}
      >
        <h4 className="fw-bold mb-1" style={{ fontSize: '1.4rem' }}>
          👥 Manage Users
        </h4>
        <p className="mb-0" style={{ opacity: 0.85, fontSize: '0.9rem' }}>
          View all registered users and manage roles
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '20px 30px 0' }}>
        <div className="position-relative" style={{ maxWidth: '400px' }}>
          <span
            className="position-absolute"
            style={{
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#999',
              fontSize: '1rem',
            }}
          >
            🔍
          </span>
          <input
            type="text"
            className="form-control shadow-none"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              paddingLeft: '36px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              padding: '10px 12px 10px 36px',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '20px 30px' }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>
              {search ? 'No users match your search.' : 'No registered users yet.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table
              className="table table-hover align-middle"
              style={{ borderRadius: '12px', overflow: 'hidden' }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#333', fontSize: '0.85rem' }}>#</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#333', fontSize: '0.85rem' }}>Name</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#333', fontSize: '0.85rem' }}>Email</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#333', fontSize: '0.85rem' }}>Phone</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#333', fontSize: '0.85rem' }}>Role</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#333', fontSize: '0.85rem' }}>Joined</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700', color: '#333', fontSize: '0.85rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 16px', color: '#555', fontSize: '0.9rem' }}>{index + 1}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: '#006491',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            flexShrink: 0,
                          }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="fw-semibold">{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#555', fontSize: '0.9rem' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px', color: '#555', fontSize: '0.9rem' }}>{user.phone || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: user.role === 'admin' ? '#0b9d3b' : '#006491',
                          color: 'white',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#555', fontSize: '0.85rem' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {user.role === 'customer' ? (
                        <button
                          className="btn btn-sm"
                          onClick={() => handleMakeAdmin(user)}
                          style={{
                            backgroundColor: '#ffc107',
                            color: '#111',
                            fontWeight: '600',
                            borderRadius: '6px',
                            padding: '5px 14px',
                            fontSize: '0.8rem',
                            border: 'none',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e6ac00';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffc107';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          ⬆ Make Admin
                        </button>
                      ) : user.email !== MAIN_ADMIN_EMAIL ? (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveAdmin(user)}
                          style={{
                            fontWeight: '600',
                            borderRadius: '6px',
                            padding: '5px 14px',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          ❌ Remove Admin
                        </button>
                      ) : (
                        <span style={{ color: '#0b9d3b', fontWeight: '600', fontSize: '0.8rem' }}>
                          👑 Super Admin
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {!loading && (
          <div
            className="d-flex justify-content-between align-items-center mt-3"
            style={{ color: '#888', fontSize: '0.85rem' }}
          >
            <span>
              Total: <b>{filteredUsers.length}</b> user{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
