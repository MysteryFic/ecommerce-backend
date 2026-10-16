import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddCartItemDto,
  CheckoutDto,
  CreateCustomerDto,
  UpdateCartItemDto,
} from './store.dto';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  listCustomers() {
    return this.prisma.customer.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createCustomer(data: CreateCustomerDto) {
    return this.prisma.customer.create({ data });
  }

  async getCart(customerId: number) {
    await this.requireCustomer(customerId);
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: true }, orderBy: { id: 'asc' } } },
    });
    return cart ?? this.prisma.cart.create({ data: { customerId }, include: { items: { include: { product: true } } } });
  }

  async addCartItem(customerId: number, data: AddCartItemDto) {
    await this.requireCustomer(customerId);
    const product = await this.prisma.product.findFirst({
      where: { id: data.productId, isActive: true },
    });
    if (!product) throw new NotFoundException(`Product ${data.productId} not found`);
    if (product.stock < (data.quantity ?? 1)) {
      throw new BadRequestException('Requested quantity is unavailable');
    }
    const cart = await this.prisma.cart.upsert({
      where: { customerId },
      create: { customerId },
      update: {},
    });
    return this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      create: { cartId: cart.id, productId: product.id, quantity: data.quantity ?? 1 },
      update: { quantity: { increment: data.quantity ?? 1 } },
      include: { product: true },
    });
  }

  async updateCartItem(customerId: number, itemId: number, data: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { customerId } },
      include: { product: true },
    });
    if (!item) throw new NotFoundException(`Cart item ${itemId} not found`);
    if (item.product.stock < data.quantity) {
      throw new BadRequestException('Requested quantity is unavailable');
    }
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity },
      include: { product: true },
    });
  }

  async removeCartItem(customerId: number, itemId: number) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { customerId } },
    });
    if (!item) throw new NotFoundException(`Cart item ${itemId} not found`);
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async checkout(customerId: number, data: CheckoutDto) {
    await this.requireCustomer(customerId);
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { customerId },
        include: { items: { include: { product: true } } },
      });
      if (!cart?.items.length) throw new BadRequestException('Cart is empty');

      let total = 0;
      for (const item of cart.items) {
        if (!item.product.isActive || item.product.stock < item.quantity) {
          throw new BadRequestException(`${item.product.name} is unavailable in the requested quantity`);
        }
        total += Number(item.product.price) * item.quantity;
      }

      for (const item of cart.items) {
        const stockUpdate = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity }, isActive: true },
          data: { stock: { decrement: item.quantity } },
        });
        if (!stockUpdate.count) {
          throw new BadRequestException(`${item.product.name} is out of stock`);
        }
      }

      const order = await tx.order.create({
        data: {
          customerId,
          total: total.toFixed(2),
          shippingAddress: data.shippingAddress,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              unitPrice: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });
  }

  listOrders(customerId?: number) {
    return this.prisma.order.findMany({
      where: customerId ? { customerId } : undefined,
      include: { items: true, customer: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async updateOrderStatus(id: number, status: OrderStatus) {
    await this.getOrder(id);
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  private async requireCustomer(id: number) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }
}