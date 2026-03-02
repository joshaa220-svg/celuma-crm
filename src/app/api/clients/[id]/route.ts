import { NextRequest, NextResponse } from "next/server";
import { EntityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequestSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import { asNullableDate, asNullableInt, asNullableNumber, asNullableString } from "@/lib/crm";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: Params) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);

  const existing = await prisma.client.findUnique({ where: { id: numericId } });
  if (!existing) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }
  if (existing.deletedAt) {
    return NextResponse.json({ error: "Cliente archivado" }, { status: 409 });
  }

  const form = await request.formData();

  const client = await prisma.client.update({
    where: { id: numericId },
    data: {
      fullName: asNullableString(form.get("fullName")) ?? "Cliente sin nombre",
      phone: asNullableString(form.get("phone")),
      email: asNullableString(form.get("email")),
      eventType: asNullableString(form.get("eventType")),
      eventDate: asNullableDate(form.get("eventDate")),
      eventLocation: asNullableString(form.get("eventLocation")),
      guestCount: asNullableInt(form.get("guestCount")),
      budgetMin: asNullableNumber(form.get("budgetMin")),
      budgetMax: asNullableNumber(form.get("budgetMax")),
      status: asNullableString(form.get("status")) ?? "Lead",
      source: asNullableString(form.get("source")),
      assignedProviderType: asNullableString(form.get("assignedProviderType")),
      notes: asNullableString(form.get("notes")),
      gdprConsent: form.get("gdprConsent") === "on" || form.get("gdprConsent") === "true",
      gdprConsentAt: asNullableDate(form.get("gdprConsentAt")),
      marketingOptIn: form.get("marketingOptIn") === "on" || form.get("marketingOptIn") === "true",
      documentLinks: asNullableString(form.get("documentLinks")),
    },
  });

  await logActivity({
    userId: user.id,
    action: "CLIENT_UPDATED",
    entityType: EntityType.CLIENT,
    entityId: client.id,
    summary: client.fullName,
    before: existing,
    after: client,
  });

  return NextResponse.json(client);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);

  const existing = await prisma.client.findUnique({ where: { id: numericId } });
  if (!existing) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }
  if (existing.deletedAt) {
    return NextResponse.json({ error: "Cliente ya archivado" }, { status: 409 });
  }

  const anonymizedClient = await prisma.client.update({
    where: { id: numericId },
    data: {
      fullName: `ANON-${numericId}`,
      phone: null,
      email: null,
      notes: null,
      documentLinks: null,
      marketingOptIn: false,
      gdprConsentAt: null,
      deletedAt: new Date(),
    },
  });

  await logActivity({
    userId: user.id,
    action: "CLIENT_ANONYMIZED",
    entityType: EntityType.CLIENT,
    entityId: numericId,
    summary: existing.fullName,
    before: existing,
    after: anonymizedClient,
  });

  return NextResponse.json({ ok: true });
}
