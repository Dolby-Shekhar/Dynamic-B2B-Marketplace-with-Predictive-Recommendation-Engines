import bcrypt from 'bcryptjs';

import { OrganizationModel } from '../models/Organization';
import { ProductModel } from '../models/Product';
import { UserModel } from '../models/User';

const demoUsers = [
  {
    firstName: 'Demo',
    lastName: 'Admin',
    email: 'admin@marketplace.com',
    password: 'Password123!',
    role: 'admin' as const,
  },
  {
    firstName: 'Demo',
    lastName: 'Buyer',
    email: 'buyer@marketplace.com',
    password: 'Password123!',
    role: 'buyer' as const,
  },
  {
    firstName: 'Demo',
    lastName: 'Vendor',
    email: 'vendor@marketplace.com',
    password: 'Password123!',
    role: 'vendor' as const,
  },
];

const demoProducts = [
  {
    name: 'Atlas AI Procurement Suite',
    description: 'Enterprise-grade procurement automation with predictive spend intelligence, supplier monitoring, and workflow orchestration.',
    category: 'Software',
    tags: ['ai', 'procurement', 'automation', 'analytics'],
    price: 1499,
    inventory: 28,
    images: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8,
    reviewCount: 154,
  },
  {
    name: 'Northstar Route Optimization',
    description: 'Advanced logistics planning for B2B fleets, warehouse capacity planning, and carrier efficiency optimization.',
    category: 'Logistics',
    tags: ['logistics', 'fleet', 'route-planning'],
    price: 980,
    inventory: 18,
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.7,
    reviewCount: 126,
  },
  {
    name: 'SignalOps Automation Cloud',
    description: 'Workflow automation for operational teams with no-code orchestration, monitoring, and compliance controls.',
    category: 'Automation',
    tags: ['automation', 'workflow', 'ops'],
    price: 1295,
    inventory: 34,
    images: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9,
    reviewCount: 211,
  },
  {
    name: 'Vantage Treasury Dashboard',
    description: 'Treasury analytics for finance leaders, with cash visibility, multi-entity reporting, and liquidity forecasting.',
    category: 'Finance',
    tags: ['finance', 'treasury', 'analytics'],
    price: 2100,
    inventory: 12,
    images: [
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8,
    reviewCount: 93,
  },
  {
    name: 'Harbor Supply Intelligence',
    description: 'Supplier performance dashboard that tracks fulfillment quality, inventory risk, and demand alerts across your network.',
    category: 'Software',
    tags: ['supply-chain', 'supplier-management', 'dashboard'],
    price: 1185,
    inventory: 27,
    images: [
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.6,
    reviewCount: 88,
  },
  {
    name: 'MetroDock Warehouse OS',
    description: 'Warehouse operations suite for inventory visibility, packing optimization, and real-time fulfillment insights.',
    category: 'Logistics',
    tags: ['warehouse', 'inventory', 'fulfillment'],
    price: 1695,
    inventory: 22,
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.7,
    reviewCount: 118,
  },
  {
    name: 'Finora Risk Control',
    description: 'Financial controls framework with approval routing, internal policy monitoring, and executive reporting.',
    category: 'Finance',
    tags: ['finance', 'risk', 'controls'],
    price: 1880,
    inventory: 16,
    images: [
      'https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9,
    reviewCount: 104,
  },
  {
    name: 'PulseFlow Orchestration Hub',
    description: 'Operational orchestration platform for cross-team process automation, alerts, and performance dashboards.',
    category: 'Automation',
    tags: ['orchestration', 'alerts', 'process'],
    price: 1420,
    inventory: 31,
    images: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8,
    reviewCount: 146,
  },
];

export const seedDemoUsers = async (): Promise<void> => {
  for (const user of demoUsers) {
    const normalizedEmail = user.email.toLowerCase();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 12);
    await UserModel.create({
      firstName: user.firstName,
      lastName: user.lastName,
      email: normalizedEmail,
      passwordHash,
      role: user.role,
      isActive: true,
    });
  }
};

export const seedDemoProducts = async (): Promise<void> => {
  const vendorUser = await UserModel.findOne({ email: 'vendor@marketplace.com' }).lean();
  if (!vendorUser) {
    return;
  }

  let organization = await OrganizationModel.findOne({ name: 'Northstar Supply Co.' });
  if (!organization) {
    organization = await OrganizationModel.create({
      name: 'Northstar Supply Co.',
      legalName: 'Northstar Supply LLC',
      industry: 'Software',
      status: 'active',
      contactEmail: 'vendor@marketplace.com',
      website: 'https://northstar-supply.com',
    });
  }

  if (!vendorUser.organizationId && organization?._id) {
    await UserModel.findByIdAndUpdate(vendorUser._id, { organizationId: organization._id });
  }

  for (const product of demoProducts) {
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existingProduct = await ProductModel.findOne({ slug });

    if (existingProduct) {
      continue;
    }

    const imageList = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.images?.[0] ?? ''];

    await ProductModel.create({
      vendorId: vendorUser._id,
      organizationId: organization._id,
      name: product.name,
      slug,
      description: product.description,
      category: product.category,
      tags: product.tags,
      imageUrl: imageList[0],
      images: imageList,
      price: product.price,
      inventory: product.inventory,
      isPublished: true,
      rating: product.rating,
      reviewCount: product.reviewCount,
    });
  }
};
