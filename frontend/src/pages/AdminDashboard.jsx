import { useEffect, useState } from 'react';
import {
  Edit3,
  Eye,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Save,
  Search,
  Store,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { apiRequest } from '../api/client.js';
import FormInput from '../components/FormInput.jsx';
import SortableHeader from '../components/SortableHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateStorePayload, validateUserPayload } from '../utils/validation.js';

const emptyUserForm = {
  name: '',
  email: '',
  address: '',
  password: '',
  role: 'USER'
};

const emptyStoreForm = {
  name: '',
  email: '',
  address: '',
  ownerId: ''
};

const formatRating = (value) => Number(value || 0).toFixed(2);

export default function AdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState({ total_users: 0, total_stores: 0, total_ratings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [userFilters, setUserFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [storeFilters, setStoreFilters] = useState({
    name: '',
    email: '',
    address: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [userForm, setUserForm] = useState(emptyUserForm);
  const [userFormErrors, setUserFormErrors] = useState({});
  const [editingUserId, setEditingUserId] = useState(null);
  const [storeForm, setStoreForm] = useState(emptyStoreForm);
  const [storeFormErrors, setStoreFormErrors] = useState({});
  const [editingStoreId, setEditingStoreId] = useState(null);

  const showMessage = (text) => {
    setMessage(text);
    setError('');
  };

  const showError = (requestError) => {
    setError(requestError.message || 'Request failed');
    setMessage('');
  };

  const fetchDashboard = async () => {
    const data = await apiRequest('/admin/dashboard', { token });
    setDashboard(data.dashboard);
  };

  const fetchUsers = async () => {
    const data = await apiRequest('/admin/users', {
      token,
      params: { ...userFilters, limit: 100 }
    });
    setUsers(data.users);
  };

  const fetchStores = async () => {
    const data = await apiRequest('/admin/stores', {
      token,
      params: { ...storeFilters, limit: 100 }
    });
    setStores(data.stores);
  };

  const fetchOwnerOptions = async () => {
    const data = await apiRequest('/admin/users', {
      token,
      params: { role: 'STORE_OWNER', sortBy: 'name', sortOrder: 'asc', limit: 100 }
    });
    setOwnerOptions(data.users);
  };

  const refreshAll = async () => {
    try {
      await Promise.all([fetchDashboard(), fetchUsers(), fetchStores(), fetchOwnerOptions()]);
    } catch (requestError) {
      showError(requestError);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    fetchUsers().catch(showError);
  }, [userFilters]);

  useEffect(() => {
    fetchStores().catch(showError);
  }, [storeFilters]);

  const handleUserSort = (field) => {
    setUserFilters((current) => ({
      ...current,
      sortBy: field,
      sortOrder: current.sortBy === field && current.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStoreSort = (field) => {
    setStoreFilters((current) => ({
      ...current,
      sortBy: field,
      sortOrder: current.sortBy === field && current.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const resetUserForm = () => {
    setUserForm(emptyUserForm);
    setUserFormErrors({});
    setEditingUserId(null);
  };

  const resetStoreForm = () => {
    setStoreForm(emptyStoreForm);
    setStoreFormErrors({});
    setEditingStoreId(null);
  };

  const submitUser = async (event) => {
    event.preventDefault();
    const nextErrors = validateUserPayload(userForm, { passwordRequired: !editingUserId });
    setUserFormErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const payload = {
      name: userForm.name,
      email: userForm.email,
      address: userForm.address,
      role: userForm.role
    };

    if (userForm.password) {
      payload.password = userForm.password;
    }

    try {
      await apiRequest(editingUserId ? `/admin/users/${editingUserId}` : '/admin/users', {
        method: editingUserId ? 'PATCH' : 'POST',
        token,
        body: payload
      });
      resetUserForm();
      showMessage(editingUserId ? 'User updated.' : 'User added.');
      await refreshAll();
    } catch (requestError) {
      showError(requestError);
    }
  };

  const submitStore = async (event) => {
    event.preventDefault();
    const nextErrors = validateStorePayload(storeForm);
    setStoreFormErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      await apiRequest(editingStoreId ? `/admin/stores/${editingStoreId}` : '/admin/stores', {
        method: editingStoreId ? 'PATCH' : 'POST',
        token,
        body: {
          ...storeForm,
          ownerId: storeForm.ownerId || null
        }
      });
      resetStoreForm();
      showMessage(editingStoreId ? 'Store updated.' : 'Store added.');
      await refreshAll();
    } catch (requestError) {
      showError(requestError);
    }
  };

  const editUser = (user) => {
    setUserForm({
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      password: ''
    });
    setEditingUserId(user.id);
    setActiveTab('users');
  };

  const editStore = (store) => {
    setStoreForm({
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.owner_id || ''
    });
    setEditingStoreId(store.id);
    setActiveTab('stores');
  };

  const viewUser = async (id) => {
    try {
      const data = await apiRequest(`/admin/users/${id}`, { token });
      setSelectedUser(data.user);
      setActiveTab('users');
    } catch (requestError) {
      showError(requestError);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) {
      return;
    }

    try {
      await apiRequest(`/admin/users/${id}`, { method: 'DELETE', token });
      showMessage('User deleted.');
      await refreshAll();
    } catch (requestError) {
      showError(requestError);
    }
  };

  const deleteStore = async (id) => {
    if (!window.confirm('Delete this store?')) {
      return;
    }

    try {
      await apiRequest(`/admin/stores/${id}`, { method: 'DELETE', token });
      showMessage('Store deleted.');
      await refreshAll();
    } catch (requestError) {
      showError(requestError);
    }
  };

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <h1>Administration</h1>
          <p>Users, stores, and ratings</p>
        </div>
        <button className="ghost-button" type="button" onClick={refreshAll}>
          <RefreshCw size={17} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="tab-row" role="tablist">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')} type="button">
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')} type="button">
          <Users size={17} />
          <span>Users</span>
        </button>
        <button className={activeTab === 'stores' ? 'active' : ''} onClick={() => setActiveTab('stores')} type="button">
          <Store size={17} />
          <span>Stores</span>
        </button>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {activeTab === 'dashboard' && (
        <div className="stat-grid">
          <div className="stat-card">
            <span>Total users</span>
            <strong>{dashboard.total_users}</strong>
          </div>
          <div className="stat-card">
            <span>Total stores</span>
            <strong>{dashboard.total_stores}</strong>
          </div>
          <div className="stat-card">
            <span>Total ratings</span>
            <strong>{dashboard.total_ratings}</strong>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="two-column">
          <form className="panel stack" onSubmit={submitUser}>
            <div className="panel-heading">
              <h2>{editingUserId ? 'Edit user' : 'Add user'}</h2>
              {editingUserId && (
                <button className="icon-button" type="button" onClick={resetUserForm} aria-label="Cancel user edit" title="Cancel">
                  <X size={16} />
                </button>
              )}
            </div>
            <FormInput
              label="Name"
              value={userForm.name}
              error={userFormErrors.name}
              onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
              required
            />
            <FormInput
              label="Email"
              type="email"
              value={userForm.email}
              error={userFormErrors.email}
              onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
              required
            />
            <FormInput
              as="textarea"
              label="Address"
              rows="3"
              value={userForm.address}
              error={userFormErrors.address}
              onChange={(event) => setUserForm({ ...userForm, address: event.target.value })}
              required
            />
            <FormInput
              label={editingUserId ? 'New password' : 'Password'}
              type="password"
              value={userForm.password}
              error={userFormErrors.password}
              onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
              required={!editingUserId}
            />
            <label className="form-field">
              <span>Role</span>
              <select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>
                <option value="USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </label>
            <button className="primary-button" type="submit">
              {editingUserId ? <Save size={18} /> : <Plus size={18} />}
              <span>{editingUserId ? 'Save user' : 'Add user'}</span>
            </button>
          </form>

          <div className="table-area">
            <div className="filters">
              <label>
                <Search size={16} />
                <input
                  placeholder="Name"
                  value={userFilters.name}
                  onChange={(event) => setUserFilters({ ...userFilters, name: event.target.value })}
                />
              </label>
              <label>
                <Search size={16} />
                <input
                  placeholder="Email"
                  value={userFilters.email}
                  onChange={(event) => setUserFilters({ ...userFilters, email: event.target.value })}
                />
              </label>
              <label>
                <Search size={16} />
                <input
                  placeholder="Address"
                  value={userFilters.address}
                  onChange={(event) => setUserFilters({ ...userFilters, address: event.target.value })}
                />
              </label>
              <select value={userFilters.role} onChange={(event) => setUserFilters({ ...userFilters, role: event.target.value })}>
                <option value="">All roles</option>
                <option value="ADMIN">System Administrator</option>
                <option value="USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <SortableHeader field="name" label="Name" sort={userFilters} onSort={handleUserSort} />
                    <SortableHeader field="email" label="Email" sort={userFilters} onSort={handleUserSort} />
                    <SortableHeader field="address" label="Address" sort={userFilters} onSort={handleUserSort} />
                    <SortableHeader field="role" label="Role" sort={userFilters} onSort={handleUserSort} />
                    <th>Owner rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.address}</td>
                      <td>{user.role}</td>
                      <td>{user.role === 'STORE_OWNER' ? formatRating(user.store_owner_average_rating) : '-'}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" type="button" onClick={() => viewUser(user.id)} aria-label="View user" title="View">
                            <Eye size={16} />
                          </button>
                          <button className="icon-button" type="button" onClick={() => editUser(user)} aria-label="Edit user" title="Edit">
                            <Edit3 size={16} />
                          </button>
                          <button className="icon-button danger" type="button" onClick={() => deleteUser(user.id)} aria-label="Delete user" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedUser && (
              <section className="detail-panel">
                <div className="panel-heading">
                  <h2>{selectedUser.name}</h2>
                  <button className="icon-button" type="button" onClick={() => setSelectedUser(null)} aria-label="Close details" title="Close">
                    <X size={16} />
                  </button>
                </div>
                <dl className="detail-list">
                  <div><dt>Email</dt><dd>{selectedUser.email}</dd></div>
                  <div><dt>Address</dt><dd>{selectedUser.address}</dd></div>
                  <div><dt>Role</dt><dd>{selectedUser.role}</dd></div>
                </dl>
                {selectedUser.owned_stores.length > 0 && (
                  <div>
                    <h3>Owned stores</h3>
                    <ul className="plain-list">
                      {selectedUser.owned_stores.map((store) => (
                        <li key={store.id}>
                          <span>{store.name}</span>
                          <strong>{formatRating(store.average_rating)}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedUser.submitted_ratings.length > 0 && (
                  <div>
                    <h3>Submitted ratings</h3>
                    <ul className="plain-list">
                      {selectedUser.submitted_ratings.map((rating) => (
                        <li key={rating.id}>
                          <span>{rating.store_name}</span>
                          <strong>{rating.rating}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      )}

      {activeTab === 'stores' && (
        <div className="two-column">
          <form className="panel stack" onSubmit={submitStore}>
            <div className="panel-heading">
              <h2>{editingStoreId ? 'Edit store' : 'Add store'}</h2>
              {editingStoreId && (
                <button className="icon-button" type="button" onClick={resetStoreForm} aria-label="Cancel store edit" title="Cancel">
                  <X size={16} />
                </button>
              )}
            </div>
            <FormInput
              label="Name"
              value={storeForm.name}
              error={storeFormErrors.name}
              onChange={(event) => setStoreForm({ ...storeForm, name: event.target.value })}
              required
            />
            <FormInput
              label="Email"
              type="email"
              value={storeForm.email}
              error={storeFormErrors.email}
              onChange={(event) => setStoreForm({ ...storeForm, email: event.target.value })}
              required
            />
            <FormInput
              as="textarea"
              label="Address"
              rows="3"
              value={storeForm.address}
              error={storeFormErrors.address}
              onChange={(event) => setStoreForm({ ...storeForm, address: event.target.value })}
              required
            />
            <label className="form-field">
              <span>Owner</span>
              <select value={storeForm.ownerId} onChange={(event) => setStoreForm({ ...storeForm, ownerId: event.target.value })}>
                <option value="">Unassigned</option>
                {ownerOptions.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" type="submit">
              {editingStoreId ? <Save size={18} /> : <Plus size={18} />}
              <span>{editingStoreId ? 'Save store' : 'Add store'}</span>
            </button>
          </form>

          <div className="table-area">
            <div className="filters">
              <label>
                <Search size={16} />
                <input
                  placeholder="Name"
                  value={storeFilters.name}
                  onChange={(event) => setStoreFilters({ ...storeFilters, name: event.target.value })}
                />
              </label>
              <label>
                <Search size={16} />
                <input
                  placeholder="Email"
                  value={storeFilters.email}
                  onChange={(event) => setStoreFilters({ ...storeFilters, email: event.target.value })}
                />
              </label>
              <label>
                <Search size={16} />
                <input
                  placeholder="Address"
                  value={storeFilters.address}
                  onChange={(event) => setStoreFilters({ ...storeFilters, address: event.target.value })}
                />
              </label>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <SortableHeader field="name" label="Name" sort={storeFilters} onSort={handleStoreSort} />
                    <SortableHeader field="email" label="Email" sort={storeFilters} onSort={handleStoreSort} />
                    <SortableHeader field="address" label="Address" sort={storeFilters} onSort={handleStoreSort} />
                    <SortableHeader field="rating" label="Rating" sort={storeFilters} onSort={handleStoreSort} />
                    <th>Owner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id}>
                      <td>{store.name}</td>
                      <td>{store.email}</td>
                      <td>{store.address}</td>
                      <td>{formatRating(store.overall_rating)}</td>
                      <td>{store.owner_name || '-'}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" type="button" onClick={() => editStore(store)} aria-label="Edit store" title="Edit">
                            <Edit3 size={16} />
                          </button>
                          <button className="icon-button danger" type="button" onClick={() => deleteStore(store.id)} aria-label="Delete store" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
