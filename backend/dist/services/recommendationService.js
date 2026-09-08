"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
const openai_1 = __importDefault(require("openai"));
const Product_1 = require("../models/Product");
const Recommendation_1 = require("../models/Recommendation");
class RecommendationService {
    client;
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        this.client = apiKey ? new openai_1.default({ apiKey }) : null;
    }
    rankProductsForUser(products, context = {}) {
        const userCategory = (context.category ?? 'Software').toLowerCase();
        const averageOrderValue = Number(context.averageOrderValue ?? 0) || 1500;
        return products
            .map((product) => {
            const rating = Number(product.rating ?? 0);
            const reviewCount = Number(product.reviewCount ?? 0);
            const price = Number(product.price ?? 0);
            const inventory = Number(product.inventory ?? 0);
            const category = String(product.category ?? 'Software');
            const categoryMatch = category.toLowerCase() === userCategory ? 18 : 0;
            const ratingScore = rating * 18 + Math.min(30, reviewCount * 0.9);
            const priceRatio = averageOrderValue > 0 ? price / averageOrderValue : 0;
            let priceFit = 0;
            if (priceRatio <= 0) {
                priceFit = -15;
            }
            else if (priceRatio < 0.35) {
                priceFit = 8 - (0.35 - priceRatio) * 40;
            }
            else if (priceRatio <= 1.8) {
                priceFit = 25 - Math.abs(priceRatio - 1) * 18;
            }
            else if (priceRatio <= 3) {
                priceFit = -18 * (priceRatio - 1.8) - 8;
            }
            else {
                priceFit = -45 - (priceRatio - 3) * 15;
            }
            let inventoryScore = inventory > 0 ? Math.min(18, inventory / 6) : -18;
            if (inventory <= 0) {
                inventoryScore -= 20;
            }
            else if (inventory <= 3) {
                inventoryScore -= 22;
            }
            else if (inventory <= 8) {
                inventoryScore -= 8;
            }
            const ageDays = product.createdAt ? (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24) : 0;
            const freshnessBoost = ageDays <= 150 ? 10 : ageDays <= 365 ? 6 : 2;
            const score = ratingScore + categoryMatch + priceFit + inventoryScore + freshnessBoost;
            return {
                productId: String(product._id),
                score: Number(score.toFixed(2)),
                reason: categoryMatch > 0
                    ? `High fit for ${category.toLowerCase()} buyers in the current price band`
                    : `Strong vendor performance in ${category} with healthy marketplace fit`,
                category,
                name: product.name ?? category,
                estimatedSavings: Math.max(0, Math.min(4000, averageOrderValue * 0.09 + (rating - 3) * 120)),
            };
        })
            .sort((left, right) => right.score - left.score)
            .slice(0, 6);
    }
    async generateForUser(userId) {
        const topProducts = await Product_1.ProductModel.find({ isPublished: true })
            .sort({ rating: -1, reviewCount: -1, createdAt: -1 })
            .limit(18)
            .lean();
        const rankedProducts = this.rankProductsForUser(topProducts, {
            category: 'Software',
            averageOrderValue: 1500,
        });
        if (!this.client) {
            await Recommendation_1.RecommendationModel.create({
                userId,
                productIds: rankedProducts.map((entry) => entry.productId),
                source: 'scoring-engine',
                metadata: { generatedAt: new Date().toISOString(), model: 'rule-based-heuristic' },
            });
            return rankedProducts;
        }
        const prompt = `You are a B2B recommendation engine. Return strict JSON with a top-level "recommendations" array. Each item must have {"productId":"string","score":number,"reason":"string"}. Prioritize products that match buyer category fit, price band, inventory availability, and quality. Use only these product IDs: ${topProducts
            .map((product) => String(product._id))
            .join(',')}.`;
        try {
            const completion = await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                response_format: { type: 'json_object' },
                messages: [{ role: 'user', content: prompt }],
            });
            const content = completion.choices[0]?.message?.content ?? '[]';
            const parsed = JSON.parse(content);
            const normalized = (parsed.recommendations ?? []).slice(0, 6);
            await Recommendation_1.RecommendationModel.create({
                userId,
                productIds: normalized.map((entry) => entry.productId),
                source: 'openai',
                metadata: { generatedAt: new Date().toISOString(), model: 'gpt-4o-mini' },
            });
            if (normalized.length > 0) {
                return normalized;
            }
        }
        catch {
            // Fall back to the deterministic heuristic scoring model below.
        }
        await Recommendation_1.RecommendationModel.create({
            userId,
            productIds: rankedProducts.map((entry) => entry.productId),
            source: 'scoring-engine',
            metadata: { generatedAt: new Date().toISOString(), model: 'rule-based-heuristic' },
        });
        return rankedProducts;
    }
    async analyzeReviewSentiment(text) {
        const normalized = text.toLowerCase();
        const positiveWords = ['great', 'excellent', 'fast', 'reliable', 'quality', 'love', 'good', 'smooth', 'efficient'];
        const negativeWords = ['slow', 'poor', 'broken', 'late', 'bad', 'terrible', 'issue', 'delayed', 'inconsistent'];
        let score = 0;
        for (const word of positiveWords) {
            if (normalized.includes(word)) {
                score += 0.2;
            }
        }
        for (const word of negativeWords) {
            if (normalized.includes(word)) {
                score -= 0.25;
            }
        }
        const clampedScore = Math.max(-1, Math.min(1, score));
        if (clampedScore > 0.15) {
            return {
                sentiment: 'positive',
                score: clampedScore,
                reasons: ['Strong positive buyer sentiment'],
            };
        }
        if (clampedScore < -0.15) {
            return {
                sentiment: 'negative',
                score: clampedScore,
                reasons: ['Negative sentiment detected'],
            };
        }
        return {
            sentiment: 'neutral',
            score: clampedScore,
            reasons: ['Moderate or mixed sentiment'],
        };
    }
}
exports.RecommendationService = RecommendationService;
//# sourceMappingURL=recommendationService.js.map