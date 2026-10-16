import { jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StoreService } from './store.service';

describe('StoreService checkout', () => {
  const customerId = 7;
  const checkoutData = { shippingAddress: '14 Market Street, Springfield' };

  function createService(cartItems: object[], stockUpdateCount = 1) {
    const items = cartItems;
    const tx = {
      cart: { findUnique: jest.fn().mockResolvedValue({ id: 19, items }) },
      product: {
        updateMany: jest.fn().mockResolvedValue({ count: stockUpdateCount }),
      },
      order: {
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({ id: 44, ...data }),
        ),
      },
      cartItem: { deleteMany: jest.fn().mockResolvedValue({ count: items.length }) },
    };
    const prisma = {
      customer: { findUnique: jest.fn().mockResolvedValue({ id: customerId }) },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    } as unknown as PrismaService;
    return { service: new StoreService(prisma), tx };
  }

  const cartItem = (price: string, quantity: number, stock = 10) => ({
    productId: 5,
    quantity,
    product: {
      id: 5,
      name: 'Test Product',
      price: new Prisma.Decimal(price),
      stock,
      isActive: true,
    },
  });

  it('creates an order, conditionally decrements inventory, and clears the cart', async () => {
    const { service, tx } = createService([cartItem('12.50', 2)]);

    await expect(service.checkout(customerId, checkoutData)).resolves.toMatchObject({
      id: 44,
      customerId,
      total: new Prisma.Decimal('25.00'),
    });
    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: { id: 5, stock: { gte: 2 }, isActive: true },
      data: { stock: { decrement: 2 } },
    });
    expect(tx.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 19 } });
  });

  it('rejects an empty cart', async () => {
    const { service, tx } = createService([]);

    await expect(service.checkout(customerId, checkoutData)).rejects.toThrow(
      new BadRequestException('Cart is empty'),
    );
    expect(tx.product.updateMany).not.toHaveBeenCalled();
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('rejects checkout when the conditional stock update finds insufficient stock', async () => {
    const { service, tx } = createService([cartItem('12.50', 2)], 0);

    await expect(service.checkout(customerId, checkoutData)).rejects.toThrow(
      new BadRequestException('Insufficient stock for Test Product'),
    );
    expect(tx.order.create).not.toHaveBeenCalled();
    expect(tx.cartItem.deleteMany).not.toHaveBeenCalled();
  });

  it('calculates totals exactly using decimal arithmetic', async () => {
    const { service, tx } = createService([
      cartItem('0.10', 3),
      {
        productId: 6,
        quantity: 1,
        product: {
          id: 6,
          name: 'Another Product',
          price: new Prisma.Decimal('0.20'),
          stock: 10,
          isActive: true,
        },
      },
    ]);

    await service.checkout(customerId, checkoutData);

    const orderData = tx.order.create.mock.calls[0][0].data;
    expect(orderData.total).toEqual(new Prisma.Decimal('0.50'));
  });
});