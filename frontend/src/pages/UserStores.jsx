import { useEffect, useState } from 'react';
import { Save, Search, Star } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import RatingInput from '../components/RatingInput.jsx';
import SortableHeader from '../components/SortableHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const formatRating = (value) => Number(value || 0).toFixed(2);

export default function UserStores() {
  const { token } = useAuth();
  const [stores, setStores] = useState([]);
  const [draftRatings, setDraftRatings] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    name: '',
    address: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const fetchStores = async () => {
    const data = await apiRequest('/stores', {
      token,
      params: { ...filters, limit: 100 }
    });
    setStores(data.stores);
  };

  useEffect(() => {
    fetchStores().catch((requestError) => setError(requestError.message));
  }, [filters]);

  const handleSort = (field) => {
    setFilters((current) => ({
      ...current,
      sortBy: field,
      sortOrder: current.sortBy === field && current.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const submitRating = async (store) => {
    const rating = draftRatings[store.id] || store.submitted_rating;

    if (!rating) {
      setError('Select a rating between 1 and 5.');
      setMessage('');
      return;
    }

    try {
      await apiRequest(`/stores/${store.id}/rating`, {
        method: 'PUT',
        token,
        body: { rating }
      });
      setMessage('Rating saved.');
      setError('');
      await fetchStores();
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
    }
  };

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <h1>Stores</h1>
          <p>Search and rate registered stores</p>
        </div>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="filters prominent">
        <label>
          <Search size={16} />
          <input
            placeholder="Search name or address"
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          />
        </label>
        <label>
          <Search size={16} />
          <input
            placeholder="Name"
            value={filters.name}
            onChange={(event) => setFilters({ ...filters, name: event.target.value })}
          />
        </label>
        <label>
          <Search size={16} />
          <input
            placeholder="Address"
            value={filters.address}
            onChange={(event) => setFilters({ ...filters, address: event.target.value })}
          />
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <SortableHeader field="name" label="Store name" sort={filters} onSort={handleSort} />
              <SortableHeader field="address" label="Address" sort={filters} onSort={handleSort} />
              <SortableHeader field="overall_rating" label="Overall rating" sort={filters} onSort={handleSort} />
              <SortableHeader field="submitted_rating" label="Your rating" sort={filters} onSort={handleSort} />
              <th>Submit</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => {
              const currentRating = draftRatings[store.id] || store.submitted_rating || 0;

              return (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.address}</td>
                  <td>
                    <span className="rating-pill">
                      <Star size={15} fill="currentColor" />
                      {formatRating(store.overall_rating)}
                    </span>
                  </td>
                  <td>{store.submitted_rating || '-'}</td>
                  <td>
                    <div className="rating-cell">
                      <RatingInput
                        value={currentRating}
                        onChange={(rating) => setDraftRatings({ ...draftRatings, [store.id]: rating })}
                      />
                      <button className="icon-button" type="button" onClick={() => submitRating(store)} aria-label="Save rating" title="Save">
                        <Save size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
