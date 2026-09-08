import { Router } from 'express';

import {
  addToCart,
  checkout,
  createProduct,
  createReview,
  deleteProduct,
  getCart,
  getOrderById,
  getProductById,
  getRecommendations,
  listOrders,
  listProducts,
  listReviewsByProduct,
  removeFromCart,
  updateProduct,
} from '../controllers/marketplaceController';
import { requireAuth, requireRole } from '../middleware/auth';

const marketplaceRouter = Router();

marketplaceRouter.get('/products', listProducts);
marketplaceRouter.get('/products/:productId', getProductById);
marketplaceRouter.post('/products', requireAuth, requireRole(['vendor', 'admin']), createProduct);
marketplaceRouter.patch('/products/:productId', requireAuth, requireRole(['vendor', 'admin']), updateProduct);
marketplaceRouter.delete('/products/:productId', requireAuth, requireRole(['vendor', 'admin']), deleteProduct);

marketplaceRouter.get('/cart', requireAuth, getCart);
marketplaceRouter.post('/cart', requireAuth, addToCart);
marketplaceRouter.delete('/cart/:productId', requireAuth, removeFromCart);

marketplaceRouter.post('/checkout', requireAuth, checkout);
marketplaceRouter.get('/orders', requireAuth, listOrders);
marketplaceRouter.get('/orders/:orderId', requireAuth, getOrderById);

marketplaceRouter.post('/reviews', requireAuth, createReview);
marketplaceRouter.get('/reviews/:productId', listReviewsByProduct);
marketplaceRouter.get('/recommendations', requireAuth, getRecommendations);

export default marketplaceRouter;
