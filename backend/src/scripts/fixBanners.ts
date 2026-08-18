import { prisma } from '../config/prisma';

const defaultImages = [
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=1920"
];

async function main() {
  const banners = await prisma.banner.findMany();
  console.log(`Found ${banners.length} banners in DB:`, banners);
  for (let i = 0; i < banners.length; i++) {
    const b = banners[i];
    const newImage = defaultImages[i % defaultImages.length];
    await prisma.banner.update({
      where: { id: b.id },
      data: { imageUrl: newImage, isActive: true },
    });
    console.log(`Updated banner ${b.id} "${b.title}" -> ${newImage}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
