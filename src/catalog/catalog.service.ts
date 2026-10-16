import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCategoryDto,
  CreateProductDto,
  UpdateCategoryDto,
  UpdateProductDto,
} from './catalog.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listCategories() {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  createCategory(data: CreateCategoryDto) {
    return this.prisma.category.create({ data });
  }

  async updateCategory(id: number, data: UpdateCategoryDto) {
    await this.requireCategory(id);
    return this.prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: number) {
    await this.requireCategory(id);
    return this.prisma.category.delete({ where: { id } });
  }

  listProducts(categoryId?: number, search?: string, page = 1, pageSize = 20) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
        ...(search ? { name: { contains: search } } : {}),
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async getProduct(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  createProduct(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }

  async updateProduct(id: number, data: UpdateProductDto) {
    await this.getProduct(id);
    return this.prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id: number) {
    await this.getProduct(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async requireCategory(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }
}