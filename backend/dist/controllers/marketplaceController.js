"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = exports.listReviewsByProduct = exports.createReview = exports.getOrderById = exports.listOrders = exports.checkout = exports.removeFromCart = exports.addToCart = exports.getCart = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.listProducts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = require("../utils/AppError");
const Cart_1 = require("../models/Cart");
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const Recommendation_1 = require("../models/Recommendation");
const Review_1 = require("../models/Review");
const recommendationService_1 = require("../services/recommendationService");
const recommendationService = new recommendationService_1.RecommendationService();
const listProducts = async (req, res, next) => {
    try {
        const { search, category } = req.query;
        const filter = { isPublished: true };
        if (category) {
            filter.category = category;
        }
        if (search) {
            filter.$text = { $search: search };
        }
        const products = await Product_1.ProductModel.find(filter)
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.status(200).json({ success: true, products });
    }
    catch (error) {
        next(error);
    }
};
exports.listProducts = listProducts;
const getProductById = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await Product_1.ProductModel.findById(productId).lean();
        if (!product) {
            next(new AppError_1.AppError(404, 'Product not found'));
            return;
        }
        res.status(200).json({ success: true, product });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            next(new AppError_1.AppError(401, 'Authentication required'));
            return;
        }
        const { name, description, category, tags, price, inventory, imageUrl, images } = req.body;
        if (!name || !description || !category || typeof price !== 'number' || typeof inventory !== 'number') {
            next(new AppError_1.AppError(400, 'Name, description, category, price, and inventory are required'));
            return;
        }
        const normalizedTags = Array.isArray(tags) ? tags.map((tag) => String(tag).trim()).filter(Boolean) : [];
        const normalizedImages = Array.isArray(images)
            ? images.map((image) => String(image).trim()).filter(Boolean)
            : [];
        const primaryImage = typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : normalizedImages[0] ?? null;
        const product = await Product_1.ProductModel.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const updatePayload = req.body;
        const product = await Product_1.ProductModel.findByIdAndUpdate(productId, updatePayload, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            next(new AppError_1.AppError(404, 'Product not found'));
            return;
        }
        res.status(200).json({ success: true, product });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await Product_1.ProductModel.findByIdAndDelete(productId);
        if (!product) {
            next(new AppError_1.AppError(404, 'Product not found'));
            return;
        }
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
const getCart = async (req, res, next) => {
    try {
        const userId = req.user?.userId ? String(req.user.userId) : null;
        if (!userId) {
            next(new AppError_1.AppError(401, 'Authentication required'));
            return;
        }
        const cart = await Cart_1.CartModel.findOne({ $or: [{ userId }, { user: userId }] }).lean();
        res.status(200).json({ success: true, cart: cart ?? { userId, items: [] } });
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
const addToCart = async (req, res, next) => {
    try {
        const userId = req.user?.userId ? String(req.user.userId) : null;
        if (!userId) {
            next(new AppError_1.AppError(401, 'Authentication required'));
            return;
        }
        const { productId, quantity = 1, variantSku } = req.body;
        const product = await Product_1.ProductModel.findById(productId);
        if (!product) {
            next(new AppError_1.AppError(404, 'Product not found'));
            return;
        }
        const invalidCarts = await Cart_1.CartModel.deleteMany({
            $or: [{ userId: null }, { userId: { $exists: false } }, { user: null }, { user: { $exists: false } }],
        });
        if (invalidCarts.deletedCount && invalidCarts.deletedCount > 0) {
            console.warn(`Removed ${invalidCarts.deletedCount} invalid cart rows before creating/updating cart for user ${userId}`);
        }
        try {
            await Cart_1.CartModel.collection.dropIndex('user_1').catch(() => undefined);
        }
        catch {
            // Ignore legacy index cleanup failures.
        }
        let cart = await Cart_1.CartModel.findOne({ $or: [{ userId }, { user: userId }] });
        if (!cart) {
            cart = await Cart_1.CartModel.create({
                userId,
                items: [{ productId, quantity, unitPrice: product.price, variantSku: variantSku ?? null }],
            });
            res.status(201).json({ success: true, cart });
            return;
        }
        const existingItem = cart.items.find((item) => String(item.productId) === productId && item.variantSku === (variantSku ?? null));
        if (existingItem) {
            existingItem.quantity += quantity;
        }
        else {
            cart.items.push({ productId, quantity, unitPrice: product.price, variantSku: variantSku ?? null });
        }
        await cart.save();
        res.status(200).json({ success: true, cart });
    }
    catch (error) {
        next(error);
    }
};
exports.addToCart = addToCart;
const removeFromCart = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            next(new AppError_1.AppError(401, 'Authentication required'));
            return;
        }
        const { productId } = req.params;
        const cart = await Cart_1.CartModel.findOne({ userId });
        if (!cart) {
            next(new AppError_1.AppError(404, 'Cart not found'));
            return;
        }
        cart.items = cart.items.filter((item) => String(item.productId) !== productId);
        await cart.save();
        res.status(200).json({ success: true, cart });
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromCart = removeFromCart;
const checkout = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            next(new AppError_1.AppError(401, 'Authentication required'));
            return;
        }
        const cart = await Cart_1.CartModel.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            next(new AppError_1.AppError(400, 'Cart is empty'));
            return;
        }
        const session = await mongoose_1.default.startSession();
        let order;
        try {
            session.startTransaction();
            const items = await Promise.all(cart.items.map(async (item) => {
                const product = await Product_1.ProductModel.findById(item.productId).session(session);
                if (!product || product.inventory < item.quantity) {
                    throw new AppError_1.AppError(400, `Insufficient inventory for product ${item.productId}`);
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
            }));
            const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
            const tax = subtotal * 0.1;
            const shipping = subtotal > 0 ? 12 : 0;
            const total = subtotal + tax + shipping;
            order = await Order_1.OrderModel.create([
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
            ], { session });
            await Cart_1.CartModel.findOneAndUpdate({ userId }, { $set: { items: [] } }, { session });
            await session.commitTransaction();
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
        res.status(201).json({ success: true, order: order?.[0] });
    }
    catch (error) {
        next(error);
    }
};
exports.checkout = checkout;
const listOrders = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            next(new AppError_1.AppError(401, 'Authentication required'));
            return;
        }
        const orders = await Order_1.OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
        res.status(200).json({ success: true, orders });
    }
    catch (error) {
        next(error);
    }
};
exports.listOrders = listOrders;
const getOrderById = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            next(new AppError_1.AppError(401, 'Authentication required'));
            return;
        }
        const order = await Order_1.OrderModel.findOne({ _id: req.params.orderId, userId }).lean();
        if (!order) {
            next(new AppError_1.AppError(404, 'Order not found'));
            return;
        }
        res.status(200).json({ success: true, order });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
const createReview = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            next(new AppError_1.AppError(401, 'Authentication required'));
            return;
        }
        const { productId, rating, comment } = req.body;
        const product = await Product_1.ProductModel.findById(productId);
        if (!product) {
            next(new AppError_1.AppError(404, 'Product not found'));
            return;
        }
        const sentiment = await recommendationService.analyzeReviewSentiment(comment);
        const review = await Review_1.ReviewModel.create({
            productId,
            userId,
            rating,
            comment,
            sentiment: sentiment.sentiment,
            sentimentScore: sentiment.score,
        });
        const allReviews = await Review_1.ReviewModel.find({ productId }).lean();
        const averageRating = allReviews.reduce((sum, item) => sum + item.rating, 0) / allReviews.length;
        product.rating = Number(averageRating.toFixed(2));
        product.reviewCount = allReviews.length;
        await product.save();
        res.status(201).json({ success: true, review });
    }
    catch (error) {
        next(error);
    }
};
exports.createReview = createReview;
const listReviewsByProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const reviews = await Review_1.ReviewModel.find({ productId }).sort({ createdAt: -1 }).lean();
        res.status(200).json({ success: true, reviews });
    }
    catch (error) {
        next(error);
    }
};
exports.listReviewsByProduct = listReviewsByProduct;
const getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            next(new AppError_1.AppError(401, 'Authentication required'));
            return;
        }
        const entries = await recommendationService.generateForUser(userId);
        const recommendation = await Recommendation_1.RecommendationModel.findOne({ userId }).sort({ createdAt: -1 }).lean();
        res.status(200).json({
            success: true,
            recommendations: entries,
            cached: recommendation,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRecommendations = getRecommendations;
//# sourceMappingURL=marketplaceController.js.map