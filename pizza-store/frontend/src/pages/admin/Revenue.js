import React, { useState, useEffect } from 'react';
import { getMonthlyRevenue } from '../../services/orderService';

const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Revenue = () => {
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMonthlyRevenue()
      .then(res => setRevenue(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = revenue.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalOrders = revenue.reduce((sum, r) => sum + r.totalOrders, 0);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-danger"></div></div>;

  return (
    <div style={{ background: '#e8f2fb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#0b9d3b', color: 'white', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container">
          <h2 className="fw-bold mb-0">Monthly Revenue</h2>
          <p className="mb-0" style={{ opacity: 0.85, fontSize: '14px' }}>
            View sales, total orders, and revenue charts
          </p>
        </div>
      </div>

      <div className="container py-4">
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card bg-danger text-white shadow">
            <div className="card-body text-center">
              <h6>Total Revenue</h6>
              <h2>₹{totalRevenue.toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white shadow">
            <div className="card-body text-center">
              <h6>Total Orders Delivered</h6>
              <h2>{totalOrders}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-dark shadow">
            <div className="card-body text-center">
              <h6>Avg Order Value</h6>
              <h2>₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <h5 className="mb-3">Month-wise Breakdown</h5>
          {revenue.length === 0 ? (
            <p className="text-muted text-center">No delivered orders yet!</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-danger">
                  <tr>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.map((r, i) => (
                    <tr key={i}>
                      <td>{months[r._id.month]}</td>
                      <td>{r._id.year}</td>
                      <td>{r.totalOrders}</td>
                      <td className="text-danger fw-bold">₹{r.totalRevenue.toLocaleString()}</td>
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
  );
};

export default Revenue;