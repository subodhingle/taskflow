import React, { useEffect, useState } from 'react';
import { Package, Search } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusColors = {
  available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'in-use': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  maintenance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  retired: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

export default function EmployeeInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/inventory')
      .then(r => setItems(r.data))
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i =>
    i.drone_name.toLowerCase().includes(search.toLowerCase()) ||
    i.model.toLowerCase().includes(search.toLowerCase()) ||
    i.serial_number.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: items.length,
    available: items.filter(i => i.status === 'available').length,
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Drone Inventory</h1>
        <p className="text-gray-500 text-sm mt-1">{stats.available} of {stats.total} drones available</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, model, or serial number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No drones found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id || item._id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{item.drone_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.model}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[item.status]}`}>
                  {item.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Serial:</span>
                  <span className="font-mono text-gray-800 dark:text-white">{item.serial_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                  <span className="text-gray-800 dark:text-white">{item.quantity}</span>
                </div>
                {item.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Location:</span>
                    <span className="text-gray-800 dark:text-white">{item.location}</span>
                  </div>
                )}
                {item.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
