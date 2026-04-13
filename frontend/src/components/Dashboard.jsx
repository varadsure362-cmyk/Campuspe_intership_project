import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getItems, createItem, updateItem, deleteItem, getStats } from '../api/itemApi';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ title: '', description: '', status: 'active' });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, statsRes] = await Promise.all([getItems(), getStats()]);
      setItems(itemsRes.data.items);
      setStats(statsRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title) {
      setError('Title is required');
      return;
    }

    setFormLoading(true);
    try {
      if (editId) {
        await updateItem(editId, form);
        setSuccess('Item updated successfully');
      } else {
        await createItem(form);
        setSuccess('Item created successfully');
      }
      setForm({ title: '', description: '', status: 'active' });
      setEditId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({ title: item.title, description: item.description || '', status: item.status });
    setEditId(item.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setSuccess('Item deleted');
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateItem(id, { status });
      fetchData();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const cancelForm = () => {
    setForm({ title: '', description: '', status: 'active' });
    setEditId(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const getStatusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'completed') return 'bg-blue-100 text-blue-700';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Welcome, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-gray-500 text-sm">Total Items</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-gray-500 text-sm">Active</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-gray-500 text-sm">Pending</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            <p className="text-gray-500 text-sm">Completed</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">My Items</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
            >
              + Add Item
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-4">
              {editId ? 'Edit Item' : 'Add New Item'}
            </h3>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Enter item title"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Enter description"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition text-sm"
                >
                  {formLoading ? 'Saving...' : editId ? 'Update Item' : 'Create Item'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded hover:bg-gray-300 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No items yet. Click "Add Item" to create one.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">#</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Description</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {item.description ? item.description.substring(0, 40) + (item.description.length > 40 ? '...' : '') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded border-0 font-medium cursor-pointer ${getStatusColor(item.status)}`}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-yellow-400 text-white px-3 py-1 rounded text-xs hover:bg-yellow-500 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Delete</h3>
              <p className="text-gray-600 text-sm mb-4">Are you sure you want to delete this item? This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
