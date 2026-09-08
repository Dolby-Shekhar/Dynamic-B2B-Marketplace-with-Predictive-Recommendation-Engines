import { useEffect, useState, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface ProductRecord {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  vendorId?: string;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  imageUrl?: string | null;
  images?: Array<string | null>;
}

interface CartItemRecord {
  productId: string;
  quantity: number;
  unitPrice: number;
  variantSku?: string | null;
}

export function MarketplacePage(): ReactElement {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [cartItems, setCartItems] = useState<CartItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadProducts = async (): Promise<void> => {
      try {
        const { data } = await api.get('/marketplace/products');
        setProducts(data.products ?? []);
      } catch {
        setError('Unable to load marketplace products right now.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, []);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setCartCount(0);
      setCartMessage(null);
      return;
    }

    const loadCart = async (): Promise<void> => {
      try {
        const { data } = await api.get('/marketplace/cart');
        const items = Array.isArray(data?.cart?.items) ? data.cart.items : [];
        setCartItems(items as CartItemRecord[]);
        setCartCount(items.reduce((total: number, item: { quantity?: number }) => total + (item.quantity ?? 0), 0));
      } catch {
        setCartItems([]);
        setCartCount(0);
      }
    };

    void loadCart();
  }, [user]);

  const updateCartState = async (): Promise<void> => {
    if (!user) {
      setCartItems([]);
      setCartCount(0);
      return;
    }

    const { data } = await api.get('/marketplace/cart');
    const items = Array.isArray(data?.cart?.items) ? data.cart.items : [];
    setCartItems(items as CartItemRecord[]);
    setCartCount(items.reduce((total: number, item: { quantity?: number }) => total + (item.quantity ?? 0), 0));
  };

  const handleAddToCart = async (productId: string): Promise<void> => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAddingId(productId);
    setCartMessage(null);

    try {
      await api.post('/marketplace/cart', { productId, quantity: 1 });
      await updateCartState();
      setCartMessage('Item added to cart.');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to add item to cart.';
      setError(message);
    } finally {
      setAddingId(null);
    }
  };

  const handleRemoveFromCart = async (productId: string): Promise<void> => {
    try {
      await api.delete(`/marketplace/cart/${productId}`);
      await updateCartState();
      setCartMessage('Item removed from cart.');
    } catch (removeError) {
      const message = removeError instanceof Error ? removeError.message : 'Unable to remove item from cart.';
      setError(message);
    }
  };

  const handleCheckout = async (): Promise<void> => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      setCartMessage('Your cart is empty.');
      return;
    }

    try {
      setCheckoutLoading(true);
      setCartMessage(null);
      const { data } = await api.post('/marketplace/checkout');
      const orderId = data?.order?._id ?? data?.order?.id ?? 'pending';
      setCartItems([]);
      setCartCount(0);
      setCartMessage(`Order ${String(orderId).slice(-6)} placed successfully.`);
    } catch (checkoutError) {
      const message = checkoutError instanceof Error ? checkoutError.message : 'Checkout failed.';
      setError(message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between rounded-[28px] border border-slate-700/80 bg-slate-900/80 px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.5)] backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-blue-300">Marketplace</p>
            <h1 className="mt-2 text-2xl font-bold text-white">Curated enterprise catalog</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:border-slate-500">Home</Link>
            <Link to="/dashboard" className="gradient-btn rounded-xl px-4 py-2 text-sm font-medium text-white">Dashboard</Link>
            <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-100">
              Cart {cartCount}
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            ['AI match', '94.2%', 'text-cyan-300'],
            ['Active vendors', '1,384', 'text-emerald-300'],
            ['Avg. cycle', '4.7 days', 'text-violet-300'],
            ['Saved spend', '$3.8M', 'text-amber-300'],
          ].map(([label, value, color]) => (
            <div key={label} className="metric-glow rounded-2xl p-4">
              <p className="text-sm text-slate-300">{label}</p>
              <p className={`mt-3 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.7fr]">
          <aside className="space-y-5">
            <div className="side-panel-card rounded-[28px] p-5">
              <div className="side-panel-header mb-5">
                <h2 className="text-lg font-semibold text-white">Filters</h2>
                <span className="sidebar-badge rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-blue-200">Live</span>
              </div>

              <div className="space-y-5 text-sm text-slate-300">
                <div>
                  <p className="mb-2 text-slate-400">Category</p>
                  <div className="space-y-2">
                    {['Software', 'Logistics', 'Automation', 'Finance'].map((item) => (
                      <label key={item} className="filter-pill">
                        <input type="checkbox" defaultChecked={item === 'Software'} />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-slate-400">Buyer profile</p>
                  <div className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-3 text-sm leading-6 text-slate-300">
                    Enterprise retail, manufacturing, and SaaS procurement teams
                  </div>
                </div>
              </div>
            </div>

            <div className="side-panel-card rounded-[28px] p-5">
              <div className="side-panel-header">
                <h2 className="text-lg font-semibold text-white">Cart</h2>
                <span className="sidebar-badge rounded-full px-2 py-1 text-xs text-blue-200">{cartCount} items</span>
              </div>

              {cartItems.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">No items added yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {cartItems.map((item) => {
                    const product = products.find((entry) => (entry._id ?? entry.id) === item.productId);
                    return (
                      <div key={item.productId} className="cart-item rounded-2xl p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">{product?.name ?? item.productId}</p>
                            <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleRemoveFromCart(item.productId)}
                            className="text-xs text-red-300 hover:text-red-200"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-slate-300">${Number(item.unitPrice).toLocaleString()} each</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {cartMessage && <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{cartMessage}</div>}

              <button
                type="button"
                disabled={cartItems.length === 0 || checkoutLoading}
                onClick={() => void handleCheckout()}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2.5 font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkoutLoading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </aside>

          <div className="space-y-5">
            {loading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">Loading marketplace products...</div>
            ) : null}

            {!loading && error ? (
              <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>
            ) : null}

            {!loading && !error && products.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
                No products are published yet. Create one from a vendor account to populate the catalog.
              </div>
            ) : null}

            {!loading && products.map((product) => {
              const productId = product._id ?? product.id ?? '';
              const productImage = product.imageUrl ?? product.images?.find(Boolean) ?? 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80';

              return (
                <article key={productId} className="market-card rounded-[30px]">
                  <div className="grid gap-0 md:grid-cols-[260px_1fr]">
                    <div className="market-card-image h-full min-h-[220px]">
                      <img
                        src={productImage}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="relative p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{product.category}</p>
                          <h3 className="mt-2 text-2xl font-semibold text-white">{product.name}</h3>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{product.description}</p>
                        </div>
                        <div className="market-card-badge rounded-2xl px-3 py-2 text-sm font-medium text-emerald-300">
                          {product.rating ? `${product.rating.toFixed(1)} / 5` : 'New listing'}
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="text-sm text-slate-400">
                          <span className="font-medium text-slate-200">Vendor:</span> {product.vendorId ? product.vendorId.slice(-6) : 'Internal'}
                          <span className="mx-3 text-slate-500">•</span>
                          <span>{product.reviewCount ?? 0} reviews</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-3xl font-bold text-white">${Number(product.price).toLocaleString()}</div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/product/${productId}`}
                              className="market-action-secondary rounded-xl px-4 py-2.5 font-medium text-slate-100 hover:border-slate-500"
                            >
                              View details
                            </Link>
                            <button
                              type="button"
                              onClick={() => void handleAddToCart(productId)}
                              disabled={!productId || addingId === productId}
                              className="market-action-primary rounded-xl px-4 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {addingId === productId ? 'Adding...' : 'Add to cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
