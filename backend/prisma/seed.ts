import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });
  console.log('Admin created:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'laptops' },
      update: {},
      create: { name: 'Laptops', slug: 'laptops' },
    }),
    prisma.category.upsert({
      where: { slug: 'smartphones' },
      update: {},
      create: { name: 'Smartphones', slug: 'smartphones' },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: { name: 'Accessories', slug: 'accessories' },
    }),
    prisma.category.upsert({
      where: { slug: 'monitors' },
      update: {},
      create: { name: 'Monitors', slug: 'monitors' },
    }),
  ]);
  console.log('Categories created:', categories.map((c) => c.name).join(', '));

  const [laptopCat, phoneCat, accCat] = categories;

  await prisma.product.upsert({
    where: { slug: 'macbook-pro-m3' },
    update: {},
    create: {
      name: 'MacBook Pro M3',
      slug: 'macbook-pro-m3',
      description: 'Professional laptop with M3 chip, 16GB RAM, 512GB SSD',
      price: 1999.99,
      stock: 15,
      categoryId: laptopCat.id,
      images: { create: [{ url: 'https://placehold.co/600x400?text=MacBook+Pro', alt: 'MacBook Pro M3' }] },
    },
  });

  await prisma.product.upsert({
    where: { slug: 'dell-xps-15' },
    update: {},
    create: {
      name: 'Dell XPS 15',
      slug: 'dell-xps-15',
      description: 'Premium laptop with Intel Core i9, 32GB RAM, 4K OLED display',
      price: 2499.99,
      stock: 8,
      categoryId: laptopCat.id,
      images: { create: [{ url: 'https://placehold.co/600x400?text=Dell+XPS', alt: 'Dell XPS 15' }] },
    },
  });

  await prisma.product.upsert({
    where: { slug: 'samsung-galaxy-s24' },
    update: {},
    create: {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24',
      description: 'Samsung flagship with 200MP camera and S Pen',
      price: 1299.99,
      stock: 30,
      categoryId: phoneCat.id,
      images: { create: [{ url: 'https://placehold.co/600x400?text=Galaxy+S24', alt: 'Samsung Galaxy S24' }] },
    },
  });

  await prisma.product.upsert({
    where: { slug: 'mouse-logitech-mx' },
    update: {},
    create: {
      name: 'Logitech MX Master 3S',
      slug: 'mouse-logitech-mx',
      description: 'Premium wireless mouse for productivity',
      price: 99.99,
      stock: 50,
      categoryId: accCat.id,
      images: { create: [{ url: 'https://placehold.co/600x400?text=MX+Master', alt: 'MX Master 3S' }] },
    },
  });

  console.log('Products created.');
  console.log('\n✅ Seed completed!');
  console.log('Admin: admin@ecommerce.com / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
