import { Link, NavLink, Outlet } from 'react-router-dom';
import { Building2, KeyRound, LogOut, Shield, Star, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const roleLabel = {
  ADMIN: 'System Administrator',
  USER: 'Normal User',
  STORE_OWNER: 'Store Owner'
};

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <Store size={24} />
          <span>Store Ratings</span>
        </Link>

        <nav className="nav-list" aria-label="Main navigation">
          {user.role === 'ADMIN' && (
            <NavLink to="/admin">
              <Shield size={18} />
              <span>Admin</span>
            </NavLink>
          )}
          {user.role === 'USER' && (
            <NavLink to="/stores">
              <Star size={18} />
              <span>Stores</span>
            </NavLink>
          )}
          {user.role === 'STORE_OWNER' && (
            <NavLink to="/owner">
              <Building2 size={18} />
              <span>Owner</span>
            </NavLink>
          )}
          <NavLink to="/password">
            <KeyRound size={18} />
            <span>Password</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div>
            <strong>{user.name}</strong>
            <span>{roleLabel[user.role]}</span>
          </div>
          <button className="icon-button" type="button" onClick={logout} aria-label="Log out" title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
