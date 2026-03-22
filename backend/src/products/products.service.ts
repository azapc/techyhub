import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, search?: string, categoryId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (categoryId) where.categoryId = categoryId;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true, images: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const { images, ...data } = dto;
    return this.prisma.product.create({
      data: {
        ...data,
        price: data.price,
        images: images?.length
          ? { create: images.map((url) => ({ url })) }
          : undefined,
      },
      include: { category: true, images: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const { images, ...data } = dto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        images: images
          ? {
              deleteMany: {},
              create: images.map((url) => ({ url })),
            }
          : undefined,
      },
      include: { category: true, images: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted' };
  }

  async stats() {
    const [totalProducts, totalOrders, revenue, lowStock] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { total: true } }),
      this.prisma.product.count({ where: { stock: { lte: 5 } } }),
    ]);

    return {
      totalProducts,
      totalOrders,
      revenue: revenue._sum.total ?? 0,
      lowStock,
    };
  }
}
