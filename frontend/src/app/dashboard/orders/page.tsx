'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function OrdersPage() {
const [orders, setOrders] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
loadOrders();
}, []);

const loadOrders = async () => {
try {
const res = await api.getOrders();
setOrders(res.data.data || []);
} catch (error) {
console.error(error);
} finally {
setLoading(false);
}
};

const copyText = (text: string) => {
navigator.clipboard.writeText(text || '');
alert('Copied Successfully');
};

return ( <div className="space-y-6">

```
  <div>
    <h1 className="text-3xl font-bold text-white">
      Orders
    </h1>

    <p className="text-gray-400 mt-1">
      Customer order management dashboard
    </p>
  </div>

  <div className="bg-black/20 border border-white/10 rounded-xl p-6">

    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold">
        Customer Orders
      </h2>

      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
        {orders.length} Orders
      </span>
    </div>

    {loading ? (
      <div className="text-center py-10 text-gray-400">
        Loading Orders...
      </div>
    ) : orders.length === 0 ? (
      <div className="text-center py-10 text-gray-400">
        No Orders Found
      </div>
    ) : (
      <div className="grid gap-4">

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-500/50 transition"
          >
            <div className="flex items-center justify-between mb-4">

              <div>
                <h3 className="text-lg font-bold text-white">
                  {order.customerName || 'Unknown Customer'}
                </h3>

                <p className="text-sm text-gray-400">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : ''}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                {order.status || 'NEW'}
              </span>

            </div>

            <div className="space-y-3">

              <div className="flex justify-between items-center">
                <span>📞 {order.phone || 'N/A'}</span>

                <button
                  onClick={() => copyText(order.phone)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                >
                  Copy
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span>
                  📍 {order.address || 'No Address'}
                </span>

                <button
                  onClick={() => copyText(order.address)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                >
                  Copy
                </button>
              </div>

              <div>
                📦 Product:
                <span className="ml-2 text-purple-400">
                  {order.productName || 'Not Specified'}
                </span>
              </div>

              <div>
                📧 Email:
                <span className="ml-2">
                  {order.email || 'N/A'}
                </span>
              </div>

            </div>
          </div>
        ))}

      </div>
    )}
  </div>
</div>

);
}
