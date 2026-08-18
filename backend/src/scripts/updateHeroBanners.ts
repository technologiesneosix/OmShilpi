import { prisma } from '../config/prisma';

const newBannersData = [
  {
    title: 'Radiance woven in gold',
    subtitle: 'CRAFTED FOR EVERY CELEBRATION',
    description: "Hallmarked 22K gold pieces hand-carved by India's master artisans, made for everyday radiance.",
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1920',
    buttonText: 'Shop Gold',
    buttonUrl: '/shop?metal=Gold',
    ctaText: 'Shop Gold',
    ctaLink: '/shop?metal=Gold',
    isActive: true,
    sortOrder: 1,
  },
  {
    title: 'Diamonds that tell your story',
    subtitle: 'REFINED BRILLIANCE',
    description: 'IGI-certified natural diamonds set in refined designs, for moments worth remembering.',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1920',
    buttonText: 'Explore Diamonds',
    buttonUrl: '/shop?metal=Diamond',
    ctaText: 'Explore Diamonds',
    ctaLink: '/shop?metal=Diamond',
    isActive: true,
    sortOrder: 2,
  },
  {
    title: 'New arrivals, timeless craft',
    subtitle: 'JUST LANDED',
    description: 'The newest additions to the Om Shilpi collection, from everyday chains to statement rings.',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1920',
    buttonText: 'Shop New Arrivals',
    buttonUrl: '/shop?isNewArrival=true',
    ctaText: 'Shop New Arrivals',
    ctaLink: '/shop?isNewArrival=true',
    isActive: true,
    sortOrder: 3,
  },
];

async function main() {
  const banners = await prisma.banner.findMany();
  console.log(`Updating ${banners.length} existing banners in DB...`);

  for (let i = 0; i < Math.min(banners.length, newBannersData.length); i++) {
    const b = banners[i];
    const newData = newBannersData[i];
    await prisma.banner.update({
      where: { id: b.id },
      data: newData,
    });
    console.log(`Updated banner ${b.id} -> "${newData.title}"`);
  }

  // If DB had fewer than 3 banners, create the remaining
  if (banners.length < newBannersData.length) {
    for (let i = banners.length; i < newBannersData.length; i++) {
      const created = await prisma.banner.create({
        data: newBannersData[i],
      });
      console.log(`Created banner ${created.id} -> "${created.title}"`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
