'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const result = orders.filter(
      (order) =>
        order.customerName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        order.phone?.includes(search)
    );

    setFilteredOrders(result);
  }, [search, orders]);

  const loadOrders = async () => {
    try {
      const res = await api.getOrders();

      setOrders(res.data.data || []);
      setFilteredOrders(res.data.data || []);
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

  const exportToExcel = () => {
  const excelData = orders.map((order) => ({
    Name: order.customerName,
    Phone: order.phone,
    Address: order.address,
    Product: order.productName || '',
    Status: order.status,
    Date: new Date(order.createdAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Orders'
  );

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const fileData = new Blob([excelBuffer]);

  saveAs(
    fileData,
    `Orders-${new Date().toISOString().split('T')[0]}.xlsx`
  );
};
  
  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Orders
          </h1>

          <p className="text-gray-400">
            Customer Order Management Dashboard
          </p>
        </div>

       <div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-white">
      Orders
    </h1>

    <p className="text-gray-400">
      Customer Order Management Dashboard
    </p>
  </div>

  <div className="flex items-center gap-3">
    <button
      onClick={exportToExcel}
      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium"
    >
      Download Excel
    </button>

    <div className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 font-medium">
      {filteredOrders.length} Orders
    </div>
  </div>
</div>
      <div className="bg-black/20 border border-white/10 rounded-xl p-5">

        <input
          type="text"
          placeholder="Search by customer name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 mb-6 outline-none"
        />

        {loading ? (
          <div className="text-center py-10 text-gray-400">
            Loading Orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No Orders Found
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-white/10 text-left">

                  <th className="py-4">Customer</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>

                </tr>
              </thead>

              <tbody>

                {filteredOrders.map((order) => (

                  <tr
                    key={order.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >

                    <td className="py-4">
                      <div className="font-semibold">
                        {order.customerName ||
                          'Unknown Customer'}
                      </div>

                      <div className="text-xs text-gray-400">
                        {order.email || 'No Email'}
                      </div>
                    </td>

                    <td>
                      <div className="flex gap-2 items-center">

                        {order.phone || 'N/A'}

                        <button
                          onClick={() =>
                            copyText(order.phone)
                          }
                          className="text-xs px-2 py-1 bg-purple-600 rounded"
                        >
                          Copy
                        </button>

                      </div>
                    </td>

                    <td className="max-w-xs truncate">
                      {order.address || 'No Address'}
                    </td>

                    <td>
                      {order.productName ||
                        'Not Specified'}
                    </td>

                    <td>
                      <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                        {order.status || 'NEW'}
                      </span>
                    </td>

                    <td>
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString()
                        : '-'}
                    </td>

                    <td>

                      <button
                        onClick={() =>
                          copyText(order.address)
                        }
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                      >
                        Copy Address
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}
      </div>
    </div>
  );
}
