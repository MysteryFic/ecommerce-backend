import { jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  it('filters active products and applies category, search, and pagination', async () => {
    const products = [{ id: 12, name: 'Wireless Headphones' }];
    const findMany = jest.fn().mockResolvedValue(products);
    const prisma = {
      product: { findMany },
    } as unknown as PrismaService;
    const service = new CatalogService(prisma);

    await expect(service.listProducts(4, 'headphones', 2, 5)).resolves.toBe(products);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        categoryId: 4,
        name: { contains: 'headphones' },
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: 5,
      take: 5,
    });
  });
});