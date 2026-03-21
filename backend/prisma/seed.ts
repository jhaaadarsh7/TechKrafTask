import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const properties = [
    {
      title: "Modern Apartment in Kathmandu",
      location: "Kathmandu",
      price: 85000,
      imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    },
    {
      title: "Cozy Family House in Lalitpur",
      location: "Lalitpur",
      price: 120000,
      imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    },
    {
      title: "Luxury Villa in Bhaktapur",
      location: "Bhaktapur",
      price: 250000,
      imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
    },
    {
      title: "Affordable Studio in Pokhara",
      location: "Pokhara",
      price: 45000,
      imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156",
    },
    {
      title: "Spacious Bungalow in Chitwan",
      location: "Chitwan",
      price: 175000,
      imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
    },
    {
      title: "City View Flat in Butwal",
      location: "Butwal",
      price: 70000,
      imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    },
  ];

  const existingCount = await prisma.property.count();

  if (existingCount > 0) {
    console.log("Properties already seeded. Skipping...");
    return;
  }

  await prisma.property.createMany({
    data: properties,
  });

  console.log("Seeded properties successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });