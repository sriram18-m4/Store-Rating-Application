import { useEffect, useState } from 'react';
import { RefreshCw, Star } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import SortableHeader from '../components/SortableHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const formatRating = (value) => Number(value || 0).toFixed(2);

export default function OwnerDashboard() {
  const { token } = useAuth();
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    storeId: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const fetchDashboard = async () => {
    const data = await apiRequest('/owner/dashboard', { token });
    setStores(data.stores);
  };

  const fetchRatings = async () => {
    const data = await apiRequest('/owner/ratings', {
      token,
      params: { ...filters, limit: 100 }
    });
    setRatings(data.ratings);
  };

  const refresh = async () => {
    try {
      setError('');
      await Promise.all([fetchDashboard(), fetchRatings()]);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    refresh();
  }, [filters]);

  const handleSort = (field) => {
    setFilters((current) => ({
      ...current,
      sortBy: field,
      sortOrder: current.sortBy === field && current.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <h1>Owner</h1>
          <p>Store ratings</p>
        </div>
        <button className="ghost-button" type="button" onClick={refresh}>
          <RefreshCw size={17} />
          <span>Refresh</span>
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="stat-grid">
        {stores.map((store) => (
          <div className="stat-card" key={store.id}>
            <span>{store.name}</span>
            <strong>
              <Star size={22} fill="currentColor" />
              {formatRating(store.average_rating)}
            </strong>
            <small>{store.total_ratings} ratings</small>
          </div>
        ))}
        {stores.length === 0 && (
          <div className="empty-state">No store is assigned to this owner.</div>
        )}
      </div>

      <div className="filters prominent">
        <select value={filters.storeId} onChange={(event) => setFilters({ ...filters, storeId: event.target.value })}>
          <option value="">All stores</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <SortableHeader field="user_name" label="User name" sort={filters} onSort={handleSort} />
              <SortableHeader field="user_email" label="Email" sort={filters} onSort={handleSort} />
              <th>Address</th>
              <th>Store</th>
              <SortableHeader field="rating" label="Rating" sort={filters} onSort={handleSort} />
              <SortableHeader field="created_at" label="Submitted" sort={filters} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {ratings.map((rating) => (
              <tr key={rating.id}>
                <td>{rating.user_name}</td>
                <td>{rating.user_email}</td>
                <td>{rating.user_address}</td>
                <td>{rating.store_name}</td>
                <td>{rating.rating}</td>
                <td>{new Date(rating.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
