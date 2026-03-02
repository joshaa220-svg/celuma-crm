import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const providerCount = await prisma.provider.count();
  if (providerCount === 0) {
    await prisma.provider.create({
      data: {
        providerType: "Decoración",
        businessName: "Proveedor de ejemplo",
        contactName: "Contacto ejemplo",
        phone: "600000000",
        email: "proveedor@ejemplo.com",
        zone: "Madrid",
        servicesOffered: "Bodas",
        initialResponse: "Rápida",
      },
    });
  }

  const clientCount = await prisma.client.count();
  if (clientCount === 0) {
    await prisma.client.create({
      data: {
        fullName: "Cliente ejemplo",
        phone: "611111111",
        email: "cliente@ejemplo.com",
        eventType: "Boda",
        status: "Lead",
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
