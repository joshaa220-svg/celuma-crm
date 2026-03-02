import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/security";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "administracion@celuma.es";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Celuma2026!";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      active: true,
      name: "Administración Celuma",
    },
    create: {
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: "ADMIN",
      active: true,
      name: "Administración Celuma",
    },
  });

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

  const taskCount = await prisma.task.count();
  if (taskCount === 0) {
    await prisma.task.create({
      data: {
        title: "Revisar proveedores pendientes",
        description: "Contactar con proveedores sin respuesta esta semana",
        status: "PENDING",
        priority: 2,
        createdById: admin.id,
        assignedToId: admin.id,
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
