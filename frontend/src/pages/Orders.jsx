import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { orderAPI } from '../utils/api';
import { fmt, fmtDate, errMsg } from '../utils/helpers';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const location = useLocation();
  const newOrderId = location.state?.newOrderId;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await orderAPI.mine();
        setOrders(data);
      } catch (err) {
        setError(errMsg(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className="orders-page">
      <h1 className="page-title">My Orders</h1>

      {newOrderId && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          ✅ Order placed successfully! Your order ID: <strong>{newOrderId}</strong>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No orders yet</div>
          <p>Start shopping to see your orders here.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div className={`order-card ${order._id === newOrderId ? 'new-order' : ''}`} key={order._id}>
            <div className="order-card-top">
              <div>
                <div className="order-id">#{order._id}</div>
                <div className="order-date">{fmtDate(order.createdAt)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`status-pill status-${order.status}`}>
                  {statusIcon(order.status)} {order.status}
                </span>
                <span className="order-total-badge">{fmt(order.totalAmount)}</span>
              </div>
            </div>

            <div className="order-items-list">
              {order.items.map((item, i) => (
                <div className="order-item-row" key={i}>
                  <img
                    src={item.image || 'https://placehold.co/48x48?text=?'}
                    alt={item.name}
                    className="order-item-img"
                    onError={(e) => { e.target.src = 'https://placehold.co/48x48?text=?'; }}
                  />
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <span style={{ color: 'var(--ink3)', fontSize: '13px' }}>×{item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--cream2)', fontSize: '13px', color: 'var(--ink3)' }}>
              📍 {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.zip}
              &nbsp;·&nbsp; 💳 {order.paymentMethod}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function statusIcon(s) {
  const icons = { Pending: '🕐', Processing: '⚙️', Shipped: '🚚', Delivered: '✅', Cancelled: '❌' };
  return icons[s] || '•';
}

export default Orders;
