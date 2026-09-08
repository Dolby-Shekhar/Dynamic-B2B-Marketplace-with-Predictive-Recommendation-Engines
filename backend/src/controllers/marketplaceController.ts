import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

import { AppError } from '../utils/AppError';
import { CartModel } from '../models/Cart';
import { OrderModel } from '../models/Order';
import { ProductModel } from '../models/Product';
import { RecommendationModel } from '../models/Recommendation';
import { ReviewModel } from '../models/Review';
import { RecommendationService } from '../services/recommendationService';

const recommendationService = new RecommendationService();

export const listProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category } = req.query as {
      search?: string;
      category?: string;
    };

    const filter: Record<string, unknown> = { isPublished: true };
    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const products = await ProductModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const product = await ProductModel.findById(productId).lean();

    if (!product) {
      next(new AppError(404, 'Product not found'));
      return;
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    const { name, description, category, tags, price, inventory, imageUrl, images } = req.body as {
      name: string;
      description: string;
      category: string;
      tags?: string[];
      price: number;
      inventory: number;
      imageUrl?: string | null;
      images?: string[] | null;
    };

    if (!name || !description || !category || typeof price !== 'number' || typeof inventory !== 'number') {
      next(new AppError(400, 'Name, description, category, price, and inventory are required'));
      return;
    }

    const normalizedTags = Array.isArray(tags) ? tags.map((tag) => String(tag).trim()).filter(Boolean) : [];
    const normalizedImages = Array.isArray(images)
      ? images.map((image) => String(image).trim()).filter(Boolean)
      : [];
    const primaryImage = typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : normalizedImages[0] ?? null;

    const product = await ProductModel.create({
      vendorId: userId,
      organizationId: userId,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      category,
      tags: normalizedTags,
      imageUrl: primaryImage,
      images: normalizedImages.length > 0 ? normalizedImages : primaryImage ? [primaryImage] : [],
      price,
      inventory,
      isPublished: true,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const updatePayload = req.body as Record<string, unknown>;

    const product = await ProductModel.findByIdAndUpdate(productId, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      next(new AppError(404, 'Product not found'));
      return;
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const product = await ProductModel.findByIdAndDelete(productId);

    if (!product) {
      next(new AppError(404, 'Product not found'));
      return;
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId ? String(req.user.userId) : null;
    if (!userId) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    const cart = await CartModel.findOne({ $or: [{ userId }, { user: userId }] }).lean();
    res.status(200).json({ success: true, cart: cart ?? { userId, items: [] } });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId ? String(req.user.userId) : null;
    if (!userId) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    const { productId, quantity = 1, variantSku } = req.body as {
      productId: string;
      quantity?: number;
      variantSku?: string | null;
    };

    const product = await ProductModel.findById(productId);
    if (!product) {
      next(new AppError(404, 'Product not found'));
      return;
    }

    const invalidCarts = await CartModel.deleteMany({
      $or: [{ userId: null }, { userId: { $exists: false } }, { user: null }, { user: { $exists: false } }],
    });
    if (invalidCarts.deletedCount && invalidCarts.deletedCount > 0) {
      console.warn(`Removed ${invalidCarts.deletedCount} invalid cart rows before creating/updating cart for user ${userId}`);
    }

    try {
      await CartModel.collection.dropIndex('user_1').catch(() => undefined);
    } catch {
      // Ignore legacy index cleanup failures.
    }

    let cart = await CartModel.findOne({ $or: [{ userId }, { user: userId }] });
    if (!cart) {
      cart = await CartModel.create({
        userId,
        items: [{ productId, quantity, unitPrice: product.price, variantSku: variantSku ?? null }],
      });
      res.status(201).json({ success: true, cart });
      return;
    }

    const existingItem = cart.items.find((item) => String(item.productId) === productId && item.variantSku === (variantSku ?? null));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, unitPrice: product.price, variantSku: variantSku ?? null });
    }

    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    const { productId } = req.params;
    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      next(new AppError(404, 'Cart not found'));
      return;
    }

    cart.items = cart.items.filter((item) => String(item.productId) !== productId) as typeof cart.items;
    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

export const checkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    const cart = await CartModel.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      next(new AppError(400, 'Cart is empty'));
      return;
    }

    const session = await mongoose.startSession();
    let order;

    try {
      session.startTransaction();

      const items = await Promise.all(
        cart.items.map(async (item) => {
          const product = await ProductModel.findById(item.productId).session(session);
          if (!product || product.inventory < item.quantity) {
            throw new AppError(400, `Insufficient inventory for product ${item.productId}`);
          }

          product.inventory -= item.quantity;
          await product.save({ session });

          return {
            productId: product._id,
            variantSku: item.variantSku,
            quantity: item.quantity,
            unitPrice: product.price,
            totalPrice: product.price * item.quantity,
          };
        }),
      );

      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.1;
      const shipping = subtotal > 0 ? 12 : 0;
      const total = subtotal + tax + shipping;

      order = await OrderModel.create(
        [
          {
            userId,
            items,
            status: 'pending',
            subtotal,
            tax,
            shipping,
            total,
            organizationId: null,
          },
        ],
        { session },
      );

      await CartModel.findOneAndUpdate({ userId }, { $set: { items: [] } }, { session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    res.status(201).json({ success: true, order: order?.[0] });
  } catch (error) {
    next(error);
  }
};

export const listOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    const order = await OrderModel.findOne({ _id: req.params.orderId, userId }).lean();
    if (!order) {
      next(new AppError(404, 'Order not found'));
      return;
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    const { productId, rating, comment } = req.body as {
      productId: string;
      rating: number;
      comment: string;
    };

    const product = await ProductModel.findById(productId);
    if (!product) {
      next(new AppError(404, 'Product not found'));
      return;
    }

    const sentiment = await recommendationService.analyzeReviewSentiment(comment);
    const review = await ReviewModel.create({
      productId,
      userId,
      rating,
      comment,
      sentiment: sentiment.sentiment,
      sentimentScore: sentiment.score,
    });

    const allReviews = await ReviewModel.find({ productId }).lean();
    const averageRating = allReviews.reduce((sum, item) => sum + item.rating, 0) / allReviews.length;
    product.rating = Number(averageRating.toFixed(2));
    product.reviewCount = allReviews.length;
    await product.save();

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

export const listReviewsByProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const reviews = await ReviewModel.find({ productId }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    const entries = await recommendationService.generateForUser(userId);
    const recommendation = await RecommendationModel.findOne({ userId }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      recommendations: entries,
      cached: recommendation,
    });
  } catch (error) {
    next(error);
  }
};
