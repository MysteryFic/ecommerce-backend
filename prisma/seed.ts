import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { faker } from '@faker-js/faker';

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'ecommerce_db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const categoryData = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Home and Living', slug: 'home-living' },
    { name: 'Outdoor', slug: 'outdoor' },
  ];
  const categories = await Promise.all(
    categoryData.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name },
        create: category,
      }),
    ),
  );

  const products = [
    {
      name: 'Wireless Headphones',
      description:
        'Comfortable over-ear headphones with clear sound and wireless listening.',
      categorySlug: 'electronics',
      price: '89.99',
      stock: 35,
    },
    {
      name: 'Portable Bluetooth Speaker',
      description:
        'A compact Bluetooth speaker for rich sound at home or on the go.',
      categorySlug: 'electronics',
      price: '54.50',
      stock: 48,
    },
    {
      name: 'Ceramic Table Lamp',
      description:
        'A glazed ceramic lamp that adds warm, focused light to a bedside or desk.',
      categorySlug: 'home-living',
      price: '42.00',
      stock: 22,
    },
    {
      name: 'Everyday Water Bottle',
      description:
        'A reusable, leak-resistant bottle sized for daily commutes and outings.',
      categorySlug: 'outdoor',
      price: '24.95',
      stock: 60,
    },
    {
      name: 'Compact Travel Backpack',
      description:
        'A lightweight carry-on backpack with organized storage for travel essentials.',
      categorySlug: 'outdoor',
      price: '68.00',
      stock: 18,
    },
  ];
  await Promise.all(
    products.map((product, index) => {
      const category = categories.find(
        (item) => item.slug === product.categorySlug,
      )!;
      const sku = `SHOP-${String(index + 1).padStart(4, '0')}`;
      return prisma.product.upsert({
        where: { sku },
        update: {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: category.id,
        },
        create: {
          name: product.name,
          slug: faker.helpers.slugify(product.name).toLowerCase(),
          description: product.description,
          sku,
          price: product.price,
          stock: product.stock,
          categoryId: category.id,
        },
      });
    }),
  );

  await prisma.customer.upsert({
    where: { email: 'shopper@example.com' },
    update: { firstName: 'Alex', lastName: 'Shopper' },
    create: {
      email: 'shopper@example.com',
      firstName: 'Alex',
      lastName: 'Shopper',
      phone: faker.phone.number(),
      cart: { create: {} },
    },
  });
  console.log(
    `Seeded ${categories.length} categories, ${products.length} products, and a sample customer`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => await prisma.$disconnect());
