import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../utils/api';
import { fmt, errMsg } from '../utils/helpers';

const EMPTY_ADDR = { fullName: '', address: '', city: '', zip: '' };

function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [addr, setAddr]       = useState(EMPTY_ADDR);
  const [payment, setPayment] = useState('Cash on Delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (f) => (e) => setAddr((p) => ({ ...p, [f]: e.target.value }));

  if (items.length === 0) {
    return (
      <div className="empty-state" style={{ marginTop: '80px' }}>
        <div className="empty-icon">🛒</div>
        <div className="empty-title">Your cart is empty</div>
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    const { fullName, address, city, zip } = addr;
    if (!fullName || !address || !city || !zip) { setError('Please fill in all shipping fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = {
        items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: addr,
        paymentMethod: payment,
      };
      const { data } = await orderAPI.create(payload);
      clearCart();
      navigate('/orders', { state: { newOrderId: data._id } });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      {/* Left: Shipping form */}
      <div>
        <div className="checkout-card" style={{ marginBottom: '20px' }}>
          <h2 className="checkout-title">Shipping Address</h2>
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Jane Smith" value={addr.fullName} onChange={set('fullName')} />
          </div>
          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input className="form-input" placeholder="123 Main Street" value={addr.address} onChange={set('address')} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" placeholder="New York" value={addr.city} onChange={set('city')} />
            </div>
            <div className="form-group">
              <label className="form-label">ZIP Code</label>
              <input className="form-input" placeholder="10001" value={addr.zip} onChange={set('zip')} />
            </div>
          </div>
        </div>

        <div className="checkout-card">
          <h2 className="checkout-title">Payment</h2>
          {['Cash on Delivery', 'Bank Transfer'].map((m) => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="radio" name="payment" value={m} checked={payment === m} onChange={() => setPayment(m)} />
              {m}
            </label>
          ))}
        </div>
      </div>

      {/* Right: Order summary */}
      <div>
        <div className="checkout-card">
          <h2 className="checkout-title">Order Summary</h2>
          {items.map((item) => (
            <div className="order-summary-item" key={item._id}>
              <span>{item.name} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>{fmt(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="order-total" style={{ marginTop: '16px' }}>
            <span>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px' }}>{fmt(total)}</span>
          </div>

          <button
            className="btn btn-primary btn-full"
            style={{ marginTop: '20px' }}
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? 'Placing Order…' : 'Place Order →'}
          </button>
          <button className="btn btn-outline btn-full" style={{ marginTop: '10px' }} onClick={() => navigate('/')}>
            ← Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
