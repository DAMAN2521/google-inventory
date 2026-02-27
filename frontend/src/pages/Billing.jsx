import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import useDebounce from '../hooks/useDebounce';
import { Search, Package, IndianRupee, Trash2, Printer, Plus, AlertTriangle, User, ShoppingCart } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Billing = () => {
    // Search & Cart state
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300); // 300ms debounce
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [cart, setCart] = useState([]);

    // Invoice / Customer state
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Focus ref for keyboard shortcuts
    const searchInputRef = useRef(null);

    // Keyboard Shortcuts (Ctrl+F for search, Ctrl+S for Add/Save)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl + F
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Ctrl + S
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (cart.length > 0) {
                    handleSaveInvoice();
                }
            }
            // Ctrl + N
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                handleClear();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, selectedCustomerId, discount]);

    // Initial Data
    useEffect(() => {
        api.get('/customers').then(res => setCustomers(res.data)).catch(console.error);
    }, []);

    // Smart Search Effect
    useEffect(() => {
        const fetchSearch = async () => {
            if (debouncedQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const res = await api.get(`/products/search?q=${debouncedQuery}`);
                setSearchResults(res.data);
            } catch (error) {
                console.error('Search error', error);
            } finally {
                setIsSearching(false);
            }
        };

        fetchSearch();
    }, [debouncedQuery]);

    // Cart operations
    const addToCart = (product) => {
        if (product.stock_quantity <= 0) {
            alert('Product is out of stock!');
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock_quantity) {
                    alert('Cannot add more than available stock!');
                    return prev;
                }
                return prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                product_id: product.id,
                name: product.name,
                sku: product.sku,
                price: parseFloat(product.selling_price),
                gst_percent: parseFloat(product.gst_percent),
                quantity: 1,
                maxStock: product.stock_quantity
            }];
        });

        // Clear search after adding
        setQuery('');
        setSearchResults([]);
        searchInputRef.current?.focus();
    };

    const updateQuantity = (productId, newQty) => {
        if (newQty <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item => {
            if (item.product_id === productId) {
                if (newQty > item.maxStock) {
                    alert('Exceeds available stock!');
                    return item;
                }
                return { ...item, quantity: parseInt(newQty, 10) };
            }
            return item;
        }));
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const handleClear = () => {
        if (cart.length > 0 && !window.confirm('Clear current invoice data?')) return;
        setCart([]);
        setQuery('');
        setSearchResults([]);
        setSelectedCustomerId('');
        setDiscount(0);
    };

    // Calculations
    const calculations = cart.reduce((acc, item) => {
        const itemSubtotal = item.price * item.quantity;
        const gstAmount = (itemSubtotal * item.gst_percent) / 100;

        acc.subtotal += itemSubtotal;
        acc.totalGst += gstAmount;
        return acc;
    }, { subtotal: 0, totalGst: 0 });

    const grandTotal = calculations.subtotal + calculations.totalGst - discount;

    // Save and generate PDF
    const handleSaveInvoice = async () => {
        if (cart.length === 0) return alert('Cart is empty!');

        setIsSaving(true);
        try {
            const payload = {
                customer_id: selectedCustomerId || null,
                discount: parseFloat(discount),
                items: cart.map(i => ({
                    product_id: i.product_id,
                    quantity: i.quantity
                }))
            };

            const res = await api.post('/invoices', payload);
            alert('Invoice created successfully!');

            // Generate PDF
            generatePDF(res.data, cart, calculations, grandTotal);

            // Reset
            handleClear();

        } catch (error) {
            console.error('Invoice save error', error);
            alert(error.response?.data?.message || 'Failed to save invoice');
        } finally {
            setIsSaving(false);
        }
    };

    const generatePDF = (invoiceData, itemsData, calc, total) => {
        const doc = new jsPDF();
        const customer = customers.find(c => c.id === parseInt(selectedCustomerId));

        // Header
        doc.setFontSize(22);
        doc.text('TAX INVOICE', 105, 20, { align: 'center' });

        // Shop details
        doc.setFontSize(10);
        doc.text('Spare Parts Store', 14, 30);
        doc.text('123 Main Street', 14, 35);
        doc.text('GSTIN: 29XXXXXXXXXXZ1', 14, 40);

        // Invoice details
        doc.text(`Invoice No: ${invoiceData.invoice_number}`, 140, 30);
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 140, 35);

        // Customer details
        if (customer) {
            doc.text(`Bill To: ${customer.name}`, 14, 50);
            if (customer.mobile) doc.text(`Phone: ${customer.mobile}`, 14, 55);
        } else {
            doc.text('Bill To: Walk-in Customer', 14, 50);
        }

        // Items table
        const tableColumn = ["Item", "SKU", "Qty", "Rate", "GST %", "Tax", "Total"];
        const tableRows = itemsData.map(item => {
            const sub = item.price * item.quantity;
            const tax = (sub * item.gst_percent) / 100;
            return [
                item.name,
                item.sku,
                item.quantity,
                item.price.toFixed(2),
                `${item.gst_percent}%`,
                tax.toFixed(2),
                (sub + tax).toFixed(2)
            ]
        });

        autoTable(doc, {
            startY: 65,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [20, 184, 166] } // Brand color
        });

        // Totals
        const finalY = doc.lastAutoTable.finalY || 65;

        doc.setFontSize(10);
        doc.text(`Subtotal: ${calc.subtotal.toFixed(2)}`, 140, finalY + 10);
        doc.text(`Total GST: ${calc.totalGst.toFixed(2)}`, 140, finalY + 15);
        if (discount > 0) doc.text(`Discount: -${discount.toFixed(2)}`, 140, finalY + 20);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Grand Total: ${total.toFixed(2)}`, 140, finalY + 30);

        doc.save(`${invoiceData.invoice_number}.pdf`);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    return (
        <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col gap-6">

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <ShoppingCart className="text-brand-500" />
                        Billing / POS
                    </h1>
                    <p className="text-dark-muted mt-1">Create invoices and manage sales.</p>
                </div>

                <div className="flex items-center gap-3 hidden lg:flex">
                    <div className="text-xs text-dark-muted flex items-center gap-4 bg-dark-card border border-dark-border px-4 py-2 rounded-lg">
                        <span className="flex items-center gap-1"><kbd className="bg-dark-bg px-1.5 rounded border border-dark-border text-slate-300">Ctrl</kbd> + <kbd className="bg-dark-bg px-1.5 rounded border border-dark-border text-slate-300">N</kbd> New</span>
                        <span className="flex items-center gap-1"><kbd className="bg-dark-bg px-1.5 rounded border border-dark-border text-slate-300">Ctrl</kbd> + <kbd className="bg-dark-bg px-1.5 rounded border border-dark-border text-slate-300">F</kbd> Search</span>
                        <span className="flex items-center gap-1"><kbd className="bg-dark-bg px-1.5 rounded border border-dark-border text-slate-300">Ctrl</kbd> + <kbd className="bg-dark-bg px-1.5 rounded border border-dark-border text-slate-300">S</kbd> Save</span>
                    </div>
                </div>
            </div>

            {/* Main Grid: Left (Search + Cart) | Right (Totals + Customer) */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Search & Cart) */}
                <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">

                    {/* Smart Search */}
                    <div className="relative z-20 shrink-0">
                        <div className="relative">
                            <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="w-full bg-dark-card border-2 border-dark-border focus:border-brand-500 rounded-xl py-4 pl-12 pr-4 text-lg text-white placeholder:text-dark-muted shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-brand-500/20"
                                placeholder="Search products by Name, SKU or Brand (Min 2 chars)..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                            {isSearching && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {query.length >= 2 && searchResults.length > 0 && (
                            <div className="absolute w-full mt-2 bg-dark-card border border-dark-border rounded-xl shadow-2xl max-h-80 overflow-y-auto custom-scrollbar">
                                <ul className="divide-y divide-dark-border">
                                    {searchResults.map(p => (
                                        <li
                                            key={p.id}
                                            className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${p.stock_quantity > 0 ? 'hover:bg-dark-border/50' : 'opacity-50 cursor-not-allowed bg-red-500/5'}`}
                                            onClick={() => p.stock_quantity > 0 && addToCart(p)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="bg-dark-bg p-2 rounded-lg mt-1">
                                                    <Package size={20} className="text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{p.name}</p>
                                                    <div className="flex items-center gap-2 text-sm mt-0.5">
                                                        <span className="text-brand-400 font-mono">{p.sku}</span>
                                                        <span className="text-dark-muted ml-2">Stock: {p.stock_quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-400">{formatCurrency(p.selling_price)}</p>
                                                <p className="text-xs text-dark-muted">+ {p.gst_percent}% GST</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {query.length >= 2 && !isSearching && searchResults.length === 0 && (
                            <div className="absolute w-full mt-2 bg-dark-card border border-dark-border rounded-xl shadow-2xl p-6 text-center text-dark-muted">
                                No products found matching "{query}"
                            </div>
                        )}
                    </div>

                    {/* Cart Area */}
                    <div className="card flex-1 flex flex-col min-h-0 relative overflow-hidden">
                        <div className="p-4 border-b border-dark-border bg-dark-bg/50 flex justify-between items-center">
                            <h2 className="font-bold text-white">Current Invoice Items ({cart.length})</h2>
                            {cart.length > 0 && (
                                <button onClick={handleClear} className="text-sm text-red-400 hover:text-red-300">Clear All</button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-dark-muted opacity-50 p-8 text-center">
                                    <ShoppingCart size={48} className="mb-4" />
                                    <p>Your cart is empty.</p>
                                    <p className="text-sm">Search for products above to add them to the invoice.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-dark-bg border-b border-dark-border sticky top-0 z-10">
                                        <tr className="text-xs text-dark-muted uppercase">
                                            <th className="p-3 pl-4">Product</th>
                                            <th className="p-3 text-center w-24">Qty</th>
                                            <th className="p-3 text-right">Price</th>
                                            <th className="p-3 text-right">GST</th>
                                            <th className="p-3 text-right">Total</th>
                                            <th className="p-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-border">
                                        {cart.map((item, idx) => {
                                            const itemSub = item.price * item.quantity;
                                            const itemGst = (itemSub * item.gst_percent) / 100;
                                            const itemTotal = itemSub + itemGst;

                                            return (
                                                <tr key={item.product_id} className="hover:bg-white/5 transition-colors" style={{ animation: `fadeIn 0.2s ease-out ${idx * 30}ms both` }}>
                                                    <td className="p-3 pl-4">
                                                        <p className="font-medium text-white">{item.name}</p>
                                                        <p className="text-xs text-brand-400 font-mono">{item.sku}</p>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={item.maxStock}
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                                                            className="w-16 bg-dark-bg border border-dark-border rounded p-1 text-center text-white focus:border-brand-500 focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-3 text-right font-medium text-slate-300">{formatCurrency(item.price)}</td>
                                                    <td className="p-3 text-right text-sm text-slate-400">
                                                        {formatCurrency(itemGst)}
                                                        <span className="block text-[10px]">({item.gst_percent}%)</span>
                                                    </td>
                                                    <td className="p-3 text-right font-bold text-emerald-400">{formatCurrency(itemTotal)}</td>
                                                    <td className="p-3 text-center">
                                                        <button
                                                            onClick={() => removeFromCart(item.product_id)}
                                                            className="text-slate-500 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Customer & Calculation) */}
                <div className="flex flex-col gap-6 shrink-0">

                    {/* Customer Selection */}
                    <div className="card p-5">
                        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                            <User size={18} className="text-brand-500" />
                            Customer Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-dark-muted mb-1.5 uppercase tracking-wider">Select Customer</label>
                                <select
                                    className="input-field"
                                    value={selectedCustomerId}
                                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                                >
                                    <option value="">Walk-in Customer (Guest)</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} - {c.mobile}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Quick add customer could go here - omitting for MVP brevity, can be managed on Customers page */}
                        </div>
                    </div>

                    {/* Calculations Box */}
                    <div className="card border-brand-500/30 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-32 bg-brand-500/10 rounded-full blur-3xl"></div>

                        <div className="p-5 flex flex-col gap-4 relative z-10">
                            <h2 className="font-bold text-white flex items-center gap-2 border-b border-dark-border pb-3">
                                <IndianRupee size={18} className="text-brand-500" />
                                Invoice Summary
                            </h2>

                            <div className="space-y-3 font-medium text-sm">
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(calculations.subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>Total GST</span>
                                    <span>{formatCurrency(calculations.totalGst)}</span>
                                </div>

                                <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-dark-border/50">
                                    <span className="flex items-center gap-2 text-brand-400">
                                        Discount
                                    </span>
                                    <div className="relative w-32">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-dark-muted">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 pl-6 text-right text-white focus:border-brand-500"
                                            value={discount}
                                            onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-500/10 p-5 border-t border-brand-500/20 relative z-10">
                            <div className="flex justify-between items-end mb-6">
                                <span className="text-lg font-bold text-white">Grand Total</span>
                                <span className="text-3xl font-black text-emerald-400 tracking-tight">{formatCurrency(grandTotal)}</span>
                            </div>

                            <button
                                onClick={handleSaveInvoice}
                                disabled={cart.length === 0 || isSaving}
                                className="btn-primary w-full py-3.5 text-base shadow-lg shadow-brand-500/20 flex justify-center items-center gap-2 relative group overflow-hidden"
                            >
                                {isSaving ? (
                                    <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
                                ) : (
                                    <>
                                        <Printer size={18} />
                                        <span>Save & Print Invoice</span>
                                    </>
                                )}
                                <div className="absolute inset-0 h-full w-full scale-0 rounded-md bg-white/20 transition-all duration-300 group-active:scale-100"></div>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Billing;
