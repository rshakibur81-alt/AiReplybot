'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Grid3X3,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  sizes: string;
  stock: 'in_stock' | 'out_of_stock';
}

const initialProducts: Product[] = [
  { id: '1', name: 'Classic White T-Shirt', price: 450, description: 'Premium quality cotton t-shirt', imageUrl: 'https://picsum.photos/200', sizes: 'S, M, L, XL', stock: 'in_stock' },
  { id: '2', name: 'Denim Jacket', price: 1899, description: 'Stylish denim jacket for casual wear', imageUrl: 'https://picsum.photos/201', sizes: 'M, L, XL', stock: 'in_stock' },
  { id: '3', name: 'Summer Dress', price: 1299, description: 'Light floral summer dress', imageUrl: 'https://picsum.photos/202', sizes: 'S, M, L', stock: 'out_of_stock' },
];

const defaultProduct: Product = {
  id: '', name: '', price: 0, description: '', imageUrl: '', sizes: '', stock: 'in_stock',
};

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product>(defaultProduct);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openAddModal = () => {
    setEditingProduct(defaultProduct);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct({ ...product });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!editingProduct.name.trim()) errs.name = 'Name is required';
    if (editingProduct.price <= 0) errs.price = 'Price must be > 0';
    if (!editingProduct.description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveProduct = () => {
    if (!validate()) return;
    if (editingProduct.id) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    } else {
      setProducts(prev => [...prev, { ...editingProduct, id: Date.now().toString() }]);
    }
    setModalOpen(false);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your product catalog for AI responses.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/10 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
        />
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Sizes</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <Package className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">৳{product.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{product.sizes}</td>
                  <td className="px-4 py-3">
                    {product.stock === 'in_stock' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                        <Check className="h-3 w-3" /> In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                        <X className="h-3 w-3" /> Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(product)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/5 bg-card p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{editingProduct.id ? 'Edit Product' : 'Add Product'}</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Product Name</label>
                  <input value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} placeholder="e.g. Classic White T-Shirt" className="w-full h-10 px-3 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50" />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Price (৳)</label>
                    <div className="relative">
                      <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} placeholder="0" className="w-full h-10 pl-8 pr-3 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50" />
                    </div>
                    {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Stock Status</label>
                    <select value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value as any})} className="w-full h-10 px-3 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50">
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Description</label>
                  <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} rows={3} placeholder="Product description..." className="w-full px-3 py-2 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 resize-none" />
                  {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Image URL</label>
                    <input value={editingProduct.imageUrl} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} placeholder="https://..." className="w-full h-10 px-3 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Sizes (comma separated)</label>
                    <input value={editingProduct.sizes} onChange={e => setEditingProduct({...editingProduct, sizes: e.target.value})} placeholder="S, M, L, XL" className="w-full h-10 px-3 rounded-xl border border-white/10 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setModalOpen(false)} className="flex-1 h-10 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={saveProduct} className="flex-1 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all">
                  {editingProduct.id ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}