import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle, X, UploadCloud } from 'lucide-react';


const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    // File Upload State
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        sku: '', name: '', brand: '', category_id: 1,
        purchase_price: '', selling_price: '', gst_percent: 18,
        stock_quantity: '', min_stock_level: ''
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpenModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                sku: product.sku, name: product.name, brand: product.brand || '',
                category_id: product.category_id, purchase_price: product.purchase_price,
                selling_price: product.selling_price, gst_percent: product.gst_percent,
                stock_quantity: product.stock_quantity, min_stock_level: product.min_stock_level
            });
        } else {
            setCurrentProduct(null);
            setFormData({
                sku: '', name: '', brand: '', category_id: 1,
                purchase_price: '', selling_price: '', gst_percent: 18,
                stock_quantity: '', min_stock_level: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Basic validation handled by required HTML attributes
            if (currentProduct) {
                await api.put(`/products/${currentProduct.id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert(error.response?.data?.message || 'Error saving product');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product', error);
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation for excel files extension
        if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
            alert('Please select a valid Excel or CSV file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await api.post('/upload/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(res.data.message);
            fetchProducts();
        } catch (error) {
            console.error('Upload error:', error);
            alert(error.response?.data?.message || 'Error occurred while uploading the file.');
        } finally {
            setUploading(false);
            // Reset the input so the same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    return (
        <div className="space-y-6 pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Package className="text-brand-500" />
                        Products Inventory
                    </h1>
                    <p className="text-dark-muted mt-1">Manage your catalog, stock levels, and pricing.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto mt-4 md:mt-0">
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none border-brand-500/30 text-brand-400 hover:bg-brand-500/10"
                    >
                        {uploading ? (
                            <span className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <UploadCloud size={18} />
                        )}
                        {uploading ? 'Importing...' : 'Import Excel'}
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none"
                    >
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative border-none py-0 w-full md:w-96">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                    <input
                        type="text"
                        placeholder="Search by SKU, Name or Brand..."
                        className="input-field pl-10 bg-dark-bg/50 border-transparent focus:bg-dark-bg transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-dark-muted whitespace-nowrap">
                    Total: <span className="font-bold text-white">{filteredProducts.length}</span> items
                </div>
            </div>

            {/* Main Table View */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-dark-bg/80 border-b border-dark-border text-xs uppercase tracking-wider text-dark-muted">
                            <tr>
                                <th className="p-4 font-semibold px-6">Product Details</th>
                                <th className="p-4 font-semibold">Pricing</th>
                                <th className="p-4 font-semibold">Stock</th>
                                <th className="p-4 font-semibold text-right px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-dark-muted">Loading products...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-dark-muted">No products found.</td>
                                </tr>
                            ) : (
                                filteredProducts.map(p => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white">{p.name}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-mono bg-dark-bg text-brand-400 px-2 py-0.5 rounded border border-dark-border">{p.sku}</span>
                                                    {p.brand && <span className="text-xs text-dark-muted">• {p.brand}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-brand-300 font-medium">{formatCurrency(p.selling_price)}</span>
                                                <span className="text-xs text-dark-muted mt-1">Cost: {formatCurrency(p.purchase_price)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold px-2.5 py-1 rounded-md text-sm ${p.stock_quantity <= p.min_stock_level ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                    {p.stock_quantity}
                                                </span>
                                                {p.stock_quantity <= p.min_stock_level && (
                                                    <AlertTriangle size={16} className="text-red-500 animate-pulse" title="Low Stock!" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(p)}
                                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-border rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id, p.name)}
                                                    className="p-1.5 text-red-400 hover:text-white hover:bg-red-500 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-dark-card border border-dark-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-5 border-b border-dark-border">
                            <h2 className="text-xl font-bold text-white">
                                {currentProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-dark-muted hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                            <form id="productForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* Product Name (Full Width) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-dark-muted mb-1.5">Product Name <span className="text-red-400">*</span></label>
                                    <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Pro Brake Pads" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-muted mb-1.5">SKU <span className="text-red-400">*</span></label>
                                    <input required type="text" className="input-field font-mono text-sm" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="SKU-XXX-001" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-muted mb-1.5">Brand</label>
                                    <input type="text" className="input-field" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} placeholder="e.g. Bosch" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-muted mb-1.5">Category ID <span className="text-red-400">*</span></label>
                                    <select required className="input-field" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: parseInt(e.target.value) })}>
                                        {/* Hardcoded for MVP since we didn't build category management UI */}
                                        <option value={1}>Electronics</option>
                                        <option value={2}>Spare Parts</option>
                                        <option value={3}>Accessories</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-muted mb-1.5">GST % <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <input required type="number" step="0.1" min="0" className="input-field pl-4 pr-8" value={formData.gst_percent} onChange={e => setFormData({ ...formData, gst_percent: parseFloat(e.target.value) })} />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted">%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-muted mb-1.5">Purchase Price <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted">₹</span>
                                        <input required type="number" step="0.01" min="0" className="input-field pl-8" value={formData.purchase_price} onChange={e => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-muted mb-1.5">Selling Price <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted">₹</span>
                                        <input required type="number" step="0.01" min="0" className="input-field pl-8 focus:ring-brand-500" value={formData.selling_price} onChange={e => setFormData({ ...formData, selling_price: parseFloat(e.target.value) })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-muted mb-1.5">Current Stock <span className="text-red-400">*</span></label>
                                    <input required type="number" min="0" className="input-field" value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value, 10) })} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-muted mb-1.5">Min Stock Alert <span className="text-red-400">*</span></label>
                                    <input required type="number" min="0" className="input-field" value={formData.min_stock_level} onChange={e => setFormData({ ...formData, min_stock_level: parseInt(e.target.value, 10) })} />
                                </div>

                            </form>
                        </div>

                        <div className="p-5 border-t border-dark-border flex justify-end gap-3 bg-dark-bg/50 rounded-b-xl">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" form="productForm" className="btn-primary min-w-[120px]">
                                {currentProduct ? 'Save Changes' : 'Create Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Products;
