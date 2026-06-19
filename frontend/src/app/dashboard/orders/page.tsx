'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await api.getOrders();
        setOrders(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-gray-400">
          Customer order information will appear here.
        </p>
      </div>

      <div className="bg-black/20 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Customer Orders
        </h2>

        {loading ? (
          <div>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-400">
            No orders found.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-white/10 rounded-lg p-4"
              >
                <p><strong>Name:</strong> {order.name}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Address:</strong> {order.address}</p>
                <p><strong>Product:</strong> {order.productName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
