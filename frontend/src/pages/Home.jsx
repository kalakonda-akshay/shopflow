import React, { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../utils/api';
import { CATEGORIES, errMsg } from '../utils/helpers';
import ProductCard from '../components/ProductCard';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort]         = useState('-createdAt');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { sort };
      if (search)            params.search   = search;
      if (category !== 'All') params.category = category;
      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          Everything you <span>need</span>,<br />delivered to your door.
        </h1>
        <p className="hero-sub">Curated products across Electronics, Fashion, Books & more.</p>
        <button className="hero-cta" onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}>
          Shop Now ↓
        </button>
      </section>

      {/* Catalog */}
      <section className="catalog-section container" id="catalog">
        <div className="section-header">
          <h2 className="section-title">
            {category === 'All' ? 'All Products' : category}
            {!loading && <span style={{ fontSize: '16px', fontFamily: 'var(--font-body)', color: 'var(--ink4)', marginLeft: '10px' }}>({products.length})</span>}
          </h2>
          <div className="filter-bar">
            <input
              className="filter-input"
              placeholder="🔍  Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="-createdAt">Newest</option>
              <option value="price">Price: Low → High</option>
              <option value="-price">Price: High → Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner" />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-title">No products found</div>
            <p>Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </>
  );
}

export default Home;
