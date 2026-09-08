const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { RecommendationService } = require('./recommendationService');

describe('RecommendationService', () => {
  it('prioritizes higher rated software products with stronger buyer demand', () => {
    const service = new RecommendationService();

    const products = [
      {
        _id: 'p-low',
        rating: 3.1,
        reviewCount: 2,
        category: 'Software',
        price: 2500,
        inventory: 5,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
      {
        _id: 'p-high',
        rating: 4.8,
        reviewCount: 46,
        category: 'Software',
        price: 1400,
        inventory: 80,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      },
    ];

    const ranked = service.rankProductsForUser(products, {
      category: 'Software',
      averageOrderValue: 1500,
    });

    assert.equal(ranked[0].productId, 'p-high');
    assert.ok(ranked[0].score > ranked[1].score);
  });

  it('penalizes unrealistic price outliers and low inventory before surfacing a recommendation', () => {
    const service = new RecommendationService();

    const products = [
      {
        _id: 'p-misaligned',
        rating: 5,
        reviewCount: 200,
        category: 'Software',
        price: 18000,
        inventory: 2,
        createdAt: new Date('2025-03-15T00:00:00.000Z'),
      },
      {
        _id: 'p-fit',
        rating: 4.6,
        reviewCount: 40,
        category: 'Software',
        price: 900,
        inventory: 18,
        createdAt: new Date('2025-05-10T00:00:00.000Z'),
      },
    ];

    const ranked = service.rankProductsForUser(products, {
      category: 'Software',
      averageOrderValue: 1500,
    });

    assert.equal(ranked[0].productId, 'p-fit');
    assert.ok(ranked[0].score > ranked[1].score);
  });
});
