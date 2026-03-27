import React, { useEffect, useState } from 'react';
import { Package, Search } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Motors', 'ESC', 'GPS', 'FC', 'Propeller', 'Frame', 'Cells', 'Battery', 'Remote', 'Goggles'];

const CATEGORY_COLORS = {
  Motors:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ESC:       'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  GPS:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  FC:        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Propeller: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  Frame:     'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  Cells:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Battery:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Remote:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Goggles:   'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

const STATUS_COLORS = {
  available:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'in-use':    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  maintenance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  retired:     'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

export default function EmployeeInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    api.get('/inventory')
      .then(r => setItems(r.data))
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const matchCat = activeCategory === 'All' || i.category === activeCategory;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.model.toLowerCase().includes(search.toLowerCase()) ||
      i.serial_number.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Drone Parts Inventory</h1>
        <p className="text-gray-500 text-sm mt-1">{items.length} items in stock</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search by name, model, or serial number..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}>
            {cat} {cat !== 'All' && `(${items.filter(i => i.category === cat).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.model}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[item.category]}`}>
                  {item.category}
                </span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{item.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Serial:</span>
                  <span className="font-mono text-xs text-gray-800 dark:text-white">{item.serial_number}</span>
                </div>
                {item.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Location:</span>
                    <span className="text-gray-800 dark:text-white">{item.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
