import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, setOpen }    = useCart();
  const navigate  = useNavigate();
  const location  = useLocation();
  const active = (p) => location.pathname === p ? 'nav-link active' : 'nav-link';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">Shop<span>Flow</span></Link>

        <div className="navbar-nav">
          <Link to="/" className={active('/')}>Shop</Link>
          {user && <Link to="/orders" className={active('/orders')}>My Orders</Link>}
          {isAdmin && <Link to="/admin" className={active('/admin')}>Admin</Link>}
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              <div className="user-chip">
                <span>{user.name.split(' ')[0]}</span>
                <span className={`user-role-badge ${user.role}`}>{user.role}</span>
              </div>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
              <button className="nav-cart" onClick={() => setOpen(true)}>
                🛒 Cart
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register"><button className="btn btn-primary btn-sm">Sign Up</button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
