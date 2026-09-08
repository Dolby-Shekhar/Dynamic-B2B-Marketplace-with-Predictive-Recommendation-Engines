import { useEffect, useState, type ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

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
  inventory?: number;
}

const fallbackImage = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80';

export function ProductDetailPage(): ReactElement {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const loadProduct = async (): Promise<void> => {
      if (!productId) {
        setError('Product not found.');
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/marketplace/products/${productId}`);
        const loadedProduct = data?.product ?? null;
        setProduct(loadedProduct);
        setSelectedImage(
          loadedProduct?.imageUrl ?? loadedProduct?.images?.find(Boolean) ?? fallbackImage,
        );
      } catch {
        setError('Unable to load this product right now.');
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [productId]);

  const galleryImages = product?.images && product.images.length > 0
    ? product.images.filter((image): image is string => Boolean(image))
    : product?.imageUrl
      ? [product.imageUrl]
      : [fallbackImage];

  const handleAddToCart = async (): Promise<void> => {
    if (!productId) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    setAdding(true);
    try {
      await api.post('/marketplace/cart', { productId, quantity: 1 });
      navigate('/marketplace');
    } catch {
      setError('Unable to add this item to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
          Loading product details...
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-red-100">
          <p className="text-xl font-semibold">We couldn’t find that product.</p>
          <Link to="/marketplace" className="mt-4 inline-block rounded-xl border border-red-300/50 px-4 py-2 text-sm hover:border-red-200">
            Return to marketplace
          </Link>
        </div>
      </main>
    );
  }

  const currentImage = selectedImage ?? galleryImages[0] ?? fallbackImage;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="detail-shell mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[28px] px-5 py-4 backdrop-blur-xl">
          <div>
            <p className="detail-ribbon inline-flex rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-cyan-200">Product detail</p>
            <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">{product.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/marketplace" className="detail-cta-secondary rounded-xl px-4 py-2 text-sm font-medium text-slate-100">Marketplace</Link>
            <Link to="/" className="detail-cta-secondary rounded-xl px-4 py-2 text-sm font-medium text-slate-100">Home</Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <div className="detail-gallery-frame overflow-hidden rounded-[30px] p-3 shadow-[0_18px_50px_rgba(15,23,42,0.45)]">
              <img
                src={currentImage}
                alt={product.name}
                className="detail-main-image h-[440px] w-full rounded-[22px] object-cover"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`detail-thumb overflow-hidden rounded-2xl border p-1 ${currentImage === image ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-[0_0_0_1px_rgba(59,130,246,0.4)]' : 'border-slate-700 hover:border-slate-500'}`}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} className="h-24 w-full rounded-xl object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="detail-info-card rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="detail-ribbon inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-blue-100">{product.category}</span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
                  {product.rating ? `${product.rating.toFixed(1)} / 5` : 'New listing'}
                </span>
              </div>

              <p className="mt-5 text-lg leading-8 text-slate-300">{product.description}</p>

              <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-800 pt-5">
                <div>
                  <p className="text-sm text-slate-400">Starting at</p>
                  <p className="text-4xl font-bold text-white">${Number(product.price).toLocaleString()}</p>
                </div>
                <div className="text-right text-sm text-slate-400">
                  <p>{product.inventory ?? 0} available</p>
                  <p>{product.reviewCount ?? 0} reviews</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleAddToCart()}
                  disabled={adding}
                  className="detail-cta-primary rounded-xl px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {adding ? 'Adding...' : 'Add to cart'}
                </button>
                <Link to="/marketplace" className="detail-cta-secondary rounded-xl px-5 py-3 font-medium text-slate-100">
                  Browse catalog
                </Link>
              </div>
            </div>

            <div className="detail-info-card rounded-[30px] p-6">
              <h2 className="text-xl font-semibold text-white">Key product details</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="detail-stat-row flex items-center justify-between rounded-xl px-4 py-3">
                  <span>Vendor profile</span>
                  <span className="text-slate-100">{product.vendorId ? product.vendorId.slice(-6) : 'Verified'}</span>
                </div>
                <div className="detail-stat-row flex items-center justify-between rounded-xl px-4 py-3">
                  <span>Fulfillment</span>
                  <span className="text-slate-100">4.7 day avg. cycle</span>
                </div>
                <div className="detail-stat-row flex items-center justify-between rounded-xl px-4 py-3">
                  <span>Tags</span>
                  <span className="text-slate-100">{product.tags && product.tags.length > 0 ? product.tags.slice(0, 3).join(', ') : 'enterprise, b2b'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
