import React, { useState, useEffect, useCallback } from 'react';
import { productAPI, orderAPI } from '../utils/api';
import { fmt, fmtDate, CATEGORIES, ORDER_STATUSES, errMsg } from '../utils/helpers';

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category: 'Electronics', image: '' };

function Admin() {
  const [tab, setTab] = useState('products');

  return (
    <div className="admin-page">
      <h1 className="page-title">Admin Panel</h1>

      <div className="admin-tabs">
        {['products', 'orders', 'stats'].map((t) => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'products' ? '📦 Products' : t === 'orders' ? '🧾 Orders' : '📊 Stats'}
          </button>
        ))}
      </div>

      {tab === 'products' && <ProductsTab />}
      {tab === 'orders'   && <OrdersTab />}
      {tab === 'stats'    && <StatsTab />}
    </div>
  );
}

/* ── Products Tab ─────────────────────────────────────────── */
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productAPI.adminAll();
      setProducts(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, image: p.image });
    setError('');
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) { setError('Name, price, and stock are required.'); return; }
    setSaving(true);
    try {
      if (editing) await productAPI.update(editing._id, { ...form, price: +form.price, stock: +form.stock });
      else         await productAPI.create({ ...form, price: +form.price, stock: +form.stock });
      closeModal();
      load();
    } catch (err) {
      setError(errMsg(err));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await productAPI.delete(id);
    load();
  };

  if (loading) return <div className="spinner" />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th><th>Name</th><th>Category</th><th>Price</th>
              <th>Stock</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><img src={p.image} alt={p.name} className="product-thumb" onError={(e) => { e.target.src = 'https://placehold.co/44x44?text=?'; }} /></td>
                <td style={{ maxWidth: '200px', fontWeight: 600 }}>{p.name}</td>
                <td>{p.category}</td>
                <td style={{ fontWeight: 600 }}>{fmt(p.price)}</td>
                <td>{p.stock}</td>
                <td><span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '3px', background: p.isActive ? 'var(--green-light)' : 'var(--rust-light)', color: p.isActive ? 'var(--green)' : 'var(--rust)', fontWeight: 700 }}>{p.isActive ? 'Active' : 'Hidden'}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            {error && <div className="form-error">{error}</div>}
            <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={set('name')} placeholder="Product name" /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-input form-textarea" value={form.description} onChange={set('description')} rows={3} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Price ($) *</label><input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} /></div>
              <div className="form-group"><label className="form-label">Stock *</label><input className="form-input" type="number" min="0" value={form.stock} onChange={set('stock')} /></div>
            </div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={set('category')}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" value={form.image} onChange={set('image')} placeholder="https://…" /></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Orders Tab ───────────────────────────────────────────── */
function OrdersTab() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const { data } = await orderAPI.all(); setOrders(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    await orderAPI.updateStatus(id, status);
    setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
  };

  if (loading) return <div className="spinner" />;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Items</th><th>Status</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--ink3)' }}>#{o._id.slice(-8)}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{o.user?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--ink3)' }}>{o.user?.email}</div>
              </td>
              <td style={{ fontSize: '13px' }}>{fmtDate(o.createdAt)}</td>
              <td style={{ fontWeight: 700 }}>{fmt(o.totalAmount)}</td>
              <td style={{ fontSize: '13px' }}>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
              <td>
                <select
                  className="status-select"
                  value={o.status}
                  onChange={(e) => handleStatus(o._id, e.target.value)}
                >
                  {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Stats Tab ────────────────────────────────────────────── */
function StatsTab() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { data } = await orderAPI.stats(); setStats(data); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="spinner" />;
  if (!stats)  return <div className="alert alert-error">Failed to load stats.</div>;

  return (
    <>
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Orders</div>
          <div className="admin-stat-value">{stats.totalOrders}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Revenue</div>
          <div className="admin-stat-value">{fmt(stats.totalRevenue)}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Order Statuses</div>
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {stats.statusBreakdown.map((s) => (
              <span key={s._id} className={`status-pill status-${s._id}`}>{s._id}: {s.count}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
