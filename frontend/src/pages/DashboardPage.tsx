import { useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';

import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface ProductDraft {
  name: string;
  description: string;
  category: string;
  price: string;
  inventory: string;
  tags: string;
  imageUrl: string;
  images: string;
}

interface VendorOnboardingDraft {
  companyName: string;
  legalName: string;
  industry: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  taxId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CatalogProduct {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  inventory?: number;
  tags?: string[];
  vendorId?: string;
}

const emptyProductDraft: ProductDraft = {
  name: '',
  description: '',
  category: 'Software',
  price: '0',
  inventory: '1',
  tags: '',
  imageUrl: '',
  images: '',
};

const emptyVendorDraft: VendorOnboardingDraft = {
  companyName: '',
  legalName: '',
  industry: 'Software',
  website: '',
  contactEmail: '',
  contactPhone: '',
  taxId: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'United States',
};

export function DashboardPage(): ReactElement {
  const { user, logout, refreshUser } = useAuth();
  const [productDraft, setProductDraft] = useState<ProductDraft>(emptyProductDraft);
  const [vendorOnboardingDraft, setVendorOnboardingDraft] = useState<VendorOnboardingDraft>(emptyVendorDraft);
  const [vendorProducts, setVendorProducts] = useState<CatalogProduct[]>([]);
  const [orderHistory, setOrderHistory] = useState<Array<{ _id?: string; total?: number; status?: string; createdAt?: string; items?: Array<{ productId?: string; quantity?: number; totalPrice?: number }> }>>([]);
  const [recommendations, setRecommendations] = useState<Array<{ id?: string; productId?: string; score?: number; reason?: string; name?: string; category?: string; estimatedSavings?: number }>>([]);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [productSuccess, setProductSuccess] = useState<string | null>(null);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [onboardingSuccess, setOnboardingSuccess] = useState<string | null>(null);
  const [isSubmittingOnboarding, setIsSubmittingOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const canManageCatalog = user?.role === 'vendor' || user?.role === 'admin';

  const onboardingSteps = [
    { title: 'Company basics', fields: ['companyName', 'industry', 'website'] },
    { title: 'Contact details', fields: ['contactEmail', 'contactPhone', 'taxId', 'country'] },
    { title: 'Address', fields: ['street', 'city', 'state', 'postalCode'] },
  ];

  const validateOnboardingStep = (step: number): string | null => {
    if (step === 0) {
      if (!vendorOnboardingDraft.companyName.trim()) {
        return 'Company name is required.';
      }
      if (!vendorOnboardingDraft.industry.trim()) {
        return 'Industry is required.';
      }
      return null;
    }

    if (step === 1) {
      if (!vendorOnboardingDraft.contactEmail.trim() && user?.email) {
        setVendorOnboardingDraft((current) => ({ ...current, contactEmail: user.email }));
      }
      if (!vendorOnboardingDraft.contactEmail.trim()) {
        return 'Contact email is required.';
      }
      return null;
    }

    if (step === 2) {
      if (!vendorOnboardingDraft.street.trim()) {
        return 'Street address is required.';
      }
      if (!vendorOnboardingDraft.city.trim()) {
        return 'City is required.';
      }
      if (!vendorOnboardingDraft.state.trim()) {
        return 'State is required.';
      }
      if (!vendorOnboardingDraft.postalCode.trim()) {
        return 'Postal code is required.';
      }
      return null;
    }

    return null;
  };

  useEffect(() => {
    const loadVendorProducts = async (): Promise<void> => {
      if (!canManageCatalog) {
        return;
      }

      try {
        const { data } = await api.get('/marketplace/products');
        const mappedProducts = Array.isArray(data?.products) ? data.products : [];
        const productsForCurrentUser = user?.id
          ? mappedProducts.filter((product: CatalogProduct) => String(product.vendorId ?? '') === String(user.id))
          : mappedProducts;

        setVendorProducts(productsForCurrentUser);
      } catch {
        setVendorProducts([]);
      }
    };

    void loadVendorProducts();
  }, [canManageCatalog, user?.id]);

  useEffect(() => {
    const loadBuyerInsights = async (): Promise<void> => {
      if (!user) {
        setOrderHistory([]);
        setRecommendations([]);
        return;
      }

      try {
        const [ordersResponse, recommendationsResponse] = await Promise.all([
          api.get('/marketplace/orders').catch(() => ({ data: { orders: [] } })),
          api.get('/marketplace/recommendations').catch(() => ({ data: { recommendations: [] } })),
        ]);

        setOrderHistory(Array.isArray(ordersResponse.data?.orders) ? ordersResponse.data.orders : []);
        setRecommendations(Array.isArray(recommendationsResponse.data?.recommendations) ? recommendationsResponse.data.recommendations : []);
      } catch {
        setOrderHistory([]);
        setRecommendations([]);
      }
    };

    void loadBuyerInsights();
  }, [user?.id, user?.role]);

  const handleCreateProduct = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setProductError(null);
    setProductSuccess(null);
    setIsSubmittingProduct(true);

    try {
      const payload = {
        name: productDraft.name.trim(),
        description: productDraft.description.trim(),
        category: productDraft.category.trim(),
        price: Number(productDraft.price),
        inventory: Number(productDraft.inventory),
        imageUrl: productDraft.imageUrl.trim(),
        images: productDraft.images
          .split(',')
          .map((image) => image.trim())
          .filter(Boolean)
          .concat(productDraft.imageUrl.trim() ? [productDraft.imageUrl.trim()] : [])
          .filter((value, index, arr) => arr.indexOf(value) === index),
        tags: productDraft.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (!payload.name || !payload.description || !payload.category || Number.isNaN(payload.price) || Number.isNaN(payload.inventory)) {
        throw new Error('Please complete all required product fields before publishing.');
      }

      const { data } = await api.post('/marketplace/products', payload);
      const createdProduct = data?.product as CatalogProduct | undefined;

      if (createdProduct) {
        setVendorProducts((current) => [createdProduct, ...current]);
      }

      setProductDraft(emptyProductDraft);
      setProductSuccess('Product published successfully and is now visible in the marketplace.');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to publish product right now.';
      setProductError(message);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleVendorOnboarding = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setOnboardingError(null);
    setOnboardingSuccess(null);

    const validationError = validateOnboardingStep(onboardingStep);
    if (validationError) {
      setOnboardingError(validationError);
      return;
    }

    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep((current) => current + 1);
      return;
    }

    setIsSubmittingOnboarding(true);

    try {
      const payload = {
        companyName: vendorOnboardingDraft.companyName.trim(),
        legalName: vendorOnboardingDraft.legalName.trim(),
        industry: vendorOnboardingDraft.industry.trim(),
        website: vendorOnboardingDraft.website.trim(),
        contactEmail: vendorOnboardingDraft.contactEmail.trim() || user?.email || '',
        contactPhone: vendorOnboardingDraft.contactPhone.trim(),
        taxId: vendorOnboardingDraft.taxId.trim(),
        street: vendorOnboardingDraft.street.trim(),
        city: vendorOnboardingDraft.city.trim(),
        state: vendorOnboardingDraft.state.trim(),
        postalCode: vendorOnboardingDraft.postalCode.trim(),
        country: vendorOnboardingDraft.country.trim(),
      };

      if (!payload.companyName || !payload.industry) {
        throw new Error('Company name and industry are required to complete onboarding.');
      }

      const { data } = await api.post('/auth/vendor/onboard', payload);
      if (data?.user) {
        await refreshUser();
      }

      setVendorOnboardingDraft(emptyVendorDraft);
      setOnboardingStep(0);
      setOnboardingSuccess('Vendor onboarding complete. Your organization is now active and ready to publish inventory.');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Vendor onboarding could not be completed.';
      setOnboardingError(message);
    } finally {
      setIsSubmittingOnboarding(false);
    }
  };

  const stepStatus = (index: number): string => {
    if (index < onboardingStep) {
      return 'completed';
    }
    if (index === onboardingStep) {
      return 'active';
    }
    return 'upcoming';
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[30px] border border-slate-700/80 bg-slate-900/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.45)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-blue-300">Marketplace control center</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Welcome back, {user?.firstName ?? 'operator'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500">Home</Link>
            <Link to="/marketplace" className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500">Marketplace</Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-400 px-4 py-2 text-sm font-medium text-white hover:brightness-110"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-4">
          {[
            { label: 'Gross GMV', value: '$1.24M', trend: '+16.2%', accent: 'cyan' },
            { label: 'Net revenue', value: '$684K', trend: '+11.8%', accent: 'emerald' },
            { label: 'Supplier fulfillment', value: '96.5%', trend: '+3.4%', accent: 'violet' },
            { label: 'Avg. order value', value: '$4.8K', trend: '+9.1%', accent: 'amber' },
          ].map((item) => (
            <div key={item.label} className="metric-glow rounded-2xl p-5 shadow-lg shadow-slate-950/20">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-400">{item.label}</p>
                <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${
                  item.accent === 'cyan' ? 'bg-cyan-500/10 text-cyan-300' :
                  item.accent === 'emerald' ? 'bg-emerald-500/10 text-emerald-300' :
                  item.accent === 'violet' ? 'bg-violet-500/10 text-violet-300' : 'bg-amber-500/10 text-amber-300'
                }`}>{item.trend}</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${
                    item.accent === 'cyan' ? 'bg-cyan-400' :
                    item.accent === 'emerald' ? 'bg-emerald-400' :
                    item.accent === 'violet' ? 'bg-violet-400' : 'bg-amber-400'
                  }`}
                  style={{ width: item.accent === 'cyan' ? '82%' : item.accent === 'emerald' ? '74%' : item.accent === 'violet' ? '96%' : '68%' }}
                />
              </div>
            </div>
          ))}
        </section>

        {!canManageCatalog && user && (
          <section className="mt-8 rounded-[28px] border border-blue-500/30 bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 p-6 shadow-[0_18px_48px_rgba(37,99,235,0.15)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-blue-300">Supplier onboarding</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Activate your supplier profile</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  Convert your buyer account into a verified supplier workspace, add your company details, and start publishing inventory to the marketplace.
                </p>
              </div>
              <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-sm text-blue-200">3-step setup</span>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {onboardingSteps.map((step, index) => (
                <div key={step.title} className={`rounded-2xl border p-3 ${stepStatus(index) === 'completed' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100' : stepStatus(index) === 'active' ? 'border-blue-500/60 bg-blue-500/10 text-blue-100' : 'border-slate-700 bg-slate-900/50 text-slate-300'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em]">Step {index + 1}</span>
                    <span className="rounded-full border px-2 py-0.5 text-[10px]">{stepStatus(index)}</span>
                  </div>
                  <p className="mt-3 font-medium">{step.title}</p>
                </div>
              ))}
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleVendorOnboarding}>
              {onboardingStep === 0 && (
                <>
                  <label className="block text-sm text-slate-300 md:col-span-1">
                    Company name
                    <input
                      value={vendorOnboardingDraft.companyName}
                      onChange={(event) => setVendorOnboardingDraft((current) => ({ ...current, companyName: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="Northstar Supply Co."
                      required
                    />
                  </label>

                  <label className="block text-sm text-slate-300 md:col-span-1">
                    Legal name
                    <input
                      value={vendorOnboardingDraft.legalName}
                      onChange={(event) => setVendorOnboardingDraft((current) => ({ ...current, legalName: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="Northstar Supply LLC"
                    />
                  </label>

                  <label className="block text-sm text-slate-300 md:col-span-1">
                    Industry
                    <input
                      value={vendorOnboardingDraft.industry}
                      onChange={(event) => setVendorOnboardingDraft((current) => ({ ...current, industry: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="Software"
                      required
                    />
                  </label>

                  <label className="block text-sm text-slate-300 md:col-span-1">
                    Website
                    <input
                      value={vendorOnboardingDraft.website}
                      onChange={(event) => setVendorOnboardingDraft((current) => ({ ...current, website: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="https://northstar-supply.com"
                    />
                  </label>
                </>
              )}

              {onboardingStep === 1 && (
                <>
                  <label className="block text-sm text-slate-300 md:col-span-1">
                    Contact email
                    <input
                      type="email"
                      value={vendorOnboardingDraft.contactEmail || user?.email || ''}
                      onChange={(event) => setVendorOnboardingDraft((current) => ({ ...current, contactEmail: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="sales@northstar-supply.com"
                      required
                    />
                  </label>

                  <label className="block text-sm text-slate-300 md:col-span-1">
                    Contact phone
                    <input
                      value={vendorOnboardingDraft.contactPhone}
                      onChange={(event) => setVendorOnboardingDraft((current) => ({ ...current, contactPhone: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="+1 (415) 555-0198"
                    />
                  </label>

                  <label className="block text-sm text-slate-300 md:col-span-1">
                    Tax ID
                    <input
                      value={vendorOnboardingDraft.taxId}
                      onChange={(event) => setVendorOnboardingDraft((current) => ({ ...current, taxId: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="US-EIN-8XXXX"
                    />
                  </label>

                  <label className="block text-sm text-slate-300 md:col-span-1">
                    Country
                    <input
                      value={vendorOnboardingDraft.country}
                      onChange={(event) => setVendorOnboardingDraft((current) => ({ ...current, country: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="United States"
                    />
                  </label>
                </>
              )}

              {onboardingStep === 2 && (
                <>
                  <label className="block text-sm text-slate-300 md:col-span-1">
                    Street
                    <input
                      value={vendorOnboardingDraft.street}
                      onChange={(event) => setVendorOnboardingDraft((current) => ({ ...current, street: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="700 Mission Street"
                    />
                  </label>

                  <label className="block text-sm text-slate-300 md:col-span-1">
                    City
                    <input
                      value={vendorOnboardingDraft.city}
                      onChange={(event) => setVendorOnboardingDraft((current) => ({ ...current, city: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="San Francisco"
                    />
                  </label>

                  <label className="block text-sm text-slate-300 md:col-span-1">
                    State
                    <input
                      value={vendorOnboardingDraft.state}
                      onChange={(event) => setVendorOnboardingDraft((current) => ({ ...current, state: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="CA"
                    />
                  </label>

                  <label className="block text-sm text-slate-300 md:col-span-1">
                    Postal code
                    <input
                      value={vendorOnboardingDraft.postalCode}
                      onChange={(event) => setVendorOnboardingDraft((current) => ({ ...current, postalCode: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="94103"
                    />
                  </label>
                </>
              )}

              {onboardingError && (
                <div className="md:col-span-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{onboardingError}</div>
              )}

              {onboardingSuccess && (
                <div className="md:col-span-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{onboardingSuccess}</div>
              )}

              <div className="md:col-span-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setOnboardingStep((current) => Math.max(0, current - 1))}
                  className={`rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 ${onboardingStep === 0 ? 'pointer-events-none opacity-40' : 'hover:border-slate-500'}`}
                  disabled={onboardingStep === 0}
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingOnboarding}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 font-medium text-white transition hover:from-blue-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingOnboarding ? 'Activating...' : onboardingStep === onboardingSteps.length - 1 ? 'Activate supplier profile' : 'Continue'}
                </button>
              </div>
            </form>
          </section>
        )}

        {canManageCatalog && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Publish inventory</h2>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">Live catalog</span>
              </div>

              <form className="space-y-4" onSubmit={handleCreateProduct}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm text-slate-300">
                    Product name
                    <input
                      value={productDraft.name}
                      onChange={(event) => setProductDraft((current) => ({ ...current, name: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="AI procurement automation stack"
                      required
                    />
                  </label>

                  <label className="block text-sm text-slate-300">
                    Category
                    <select
                      value={productDraft.category}
                      onChange={(event) => setProductDraft((current) => ({ ...current, category: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                    >
                      <option value="Software">Software</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Automation">Automation</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </label>
                </div>

                <label className="block text-sm text-slate-300">
                  Description
                  <textarea
                    value={productDraft.description}
                    onChange={(event) => setProductDraft((current) => ({ ...current, description: event.target.value }))}
                    className="mt-1 min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                    placeholder="Describe your offering, target buyer, and delivery scope."
                    required
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block text-sm text-slate-300">
                    Price
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productDraft.price}
                      onChange={(event) => setProductDraft((current) => ({ ...current, price: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      required
                    />
                  </label>

                  <label className="block text-sm text-slate-300">
                    Inventory
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={productDraft.inventory}
                      onChange={(event) => setProductDraft((current) => ({ ...current, inventory: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      required
                    />
                  </label>

                  <label className="block text-sm text-slate-300">
                    Tags
                    <input
                      value={productDraft.tags}
                      onChange={(event) => setProductDraft((current) => ({ ...current, tags: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="ai, automation, procurement"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm text-slate-300">
                    Primary image URL
                    <input
                      value={productDraft.imageUrl}
                      onChange={(event) => setProductDraft((current) => ({ ...current, imageUrl: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </label>

                  <label className="block text-sm text-slate-300">
                    Additional image URLs
                    <input
                      value={productDraft.images}
                      onChange={(event) => setProductDraft((current) => ({ ...current, images: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
                      placeholder="https://..., https://..."
                    />
                  </label>
                </div>

                {productError && (
                  <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{productError}</div>
                )}

                {productSuccess && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{productSuccess}</div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingProduct ? 'Publishing...' : 'Publish product'}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Catalog snapshot</h2>
              <div className="mt-5 space-y-3">
                {vendorProducts.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                    No published products yet. Use the form to create your first listing.
                  </div>
                ) : (
                  vendorProducts.slice(0, 4).map((product) => (
                    <div key={product._id ?? product.id ?? product.name} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">{product.name}</p>
                        <span className="text-sm text-emerald-300">${Number(product.price).toLocaleString()}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{product.category}</p>
                      <p className="mt-2 text-sm text-slate-300">{product.inventory ?? 0} units available</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Procurement engagement</h2>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">Live</span>
              </div>

              <div className="flex h-52 items-end gap-3">
                {[28, 42, 32, 58, 62, 70, 95, 86, 102, 74].map((bar, index) => (
                  <div key={index} className="flex-1 rounded-t-2xl bg-gradient-to-t from-blue-600 to-cyan-400" style={{ height: `${bar}%` }} />
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Order history</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Recent</span>
              </div>

              {orderHistory.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                  No orders yet. Your latest marketplace purchases will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {orderHistory.slice(0, 4).map((order) => (
                    <div key={order._id ?? `${order.createdAt ?? 'order'}-${Math.random()}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">Order {String(order._id ?? '').slice(-6) || 'pending'}</p>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 capitalize">{order.status ?? 'pending'}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
                        <span>{order.items?.length ?? 0} items</span>
                        <span>${Number(order.total ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">AI recommendations</h2>
              <div className="mt-5 space-y-3">
                {recommendations.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                    AI suggestions will appear after your latest buying patterns are analyzed.
                  </div>
                ) : (
                  recommendations.slice(0, 3).map((item) => (
                    <div key={item.id ?? item.productId ?? item.name ?? 'recommendation'} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">{item.name ?? item.productId ?? 'Recommended item'}</p>
                        <span className="text-xs text-blue-300">{item.score ? `${Number(item.score * 100).toFixed(0)}%` : 'Match'}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{item.reason ?? item.category ?? 'Strong fit for your buying profile.'}</p>
                      {typeof item.estimatedSavings === 'number' && (
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-300">Save ${Number(item.estimatedSavings).toLocaleString()}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Account profile</h2>
              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-slate-400">Email</p>
                  <p className="mt-1 font-medium text-white">{user?.email ?? 'Not available'}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-slate-400">Role</p>
                  <p className="mt-1 font-medium capitalize text-white">{user?.role ?? 'buyer'}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-slate-400">Security</p>
                  <p className="mt-1 font-medium text-emerald-300">Session active and encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
