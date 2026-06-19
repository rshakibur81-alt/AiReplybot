'use client';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-gray-400">
          Customer order information will appear here.
        </p>
      </div>

      <div className="bg-black/20 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Customer Orders</h2>

        <div className="text-gray-400">
          No orders found.
        </div>
      </div>
    </div>
  );
}
