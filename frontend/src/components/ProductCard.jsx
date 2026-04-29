import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fmt, stockLabel } from '../utils/helpers';

function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user }    = useAuth();
  const stock = stockLabel(product.stock);

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-img"
          onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
        />
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <div className="product-name">{product.name}</div>
        <div className="product-footer">
          <div className="product-price">{fmt(product.price)}</div>
          <span className={`stock-badge ${stock.cls}`}>{stock.label}</span>
        </div>
        {user ? (
          <button
            className="btn btn-add-cart"
            onClick={() => addItem(product)}
            disabled={product.stock <= 0}
          >
            {product.stock <= 0 ? 'Out of Stock' : '+ Add to Cart'}
          </button>
        ) : (
          <button
            className="btn btn-add-cart"
            style={{ background: 'var(--ink3)' }}
            onClick={() => window.location.href = '/login'}
          >
            Login to Buy
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
