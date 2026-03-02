import { NextRequest, NextResponse } from "next/server";
import { EntityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequestSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import {
  asBoolean,
  asNullableDate,
  asNullableNumber,
  asNullableString,
} from "@/lib/crm";

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

  const existing = await prisma.provider.findUnique({ where: { id: numericId } });
  if (!existing) {
    return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
  }
  if (existing.deletedAt) {
    return NextResponse.json({ error: "Proveedor archivado" }, { status: 409 });
  }

  const form = await request.formData();

  const provider = await prisma.provider.update({
    where: { id: numericId },
    data: {
      providerType: asNullableString(form.get("providerType")) ?? "Otros",
      businessName: asNullableString(form.get("businessName")) ?? "Proveedor sin nombre",
      contactName: asNullableString(form.get("contactName")),
      phone: asNullableString(form.get("phone")),
      email: asNullableString(form.get("email")),
      instagram: asNullableString(form.get("instagram")),
      website: asNullableString(form.get("website")),
      zone: asNullableString(form.get("zone")),
      servicesOffered: asNullableString(form.get("servicesOffered")),
      minPrice: asNullableNumber(form.get("minPrice")),
      avgPrice: asNullableNumber(form.get("avgPrice")),
      maxPrice: asNullableNumber(form.get("maxPrice")),
      specialConditions: asNullableString(form.get("specialConditions")),
      availableDays: asNullableString(form.get("availableDays")),
      usualHours: asNullableString(form.get("usualHours")),
      setupTime: asNullableString(form.get("setupTime")),
      teardownTime: asNullableString(form.get("teardownTime")),
      technicalNeeds: asNullableString(form.get("technicalNeeds")),
      firstContactDate: asNullableDate(form.get("firstContactDate")),
      contactChannel: asNullableString(form.get("contactChannel")),
      initialResponse: asNullableString(form.get("initialResponse")),
      contractedStatus: asNullableString(form.get("contractedStatus")),
      hired: asBoolean(form.get("hired")),
      relationshipType: asNullableString(form.get("relationshipType")),
      agreedConditions: asNullableString(form.get("agreedConditions")),
      professionalism: asNullableNumber(form.get("professionalism")),
      communication: asNullableNumber(form.get("communication")),
      punctuality: asNullableNumber(form.get("punctuality")),
      serviceQuality: asNullableNumber(form.get("serviceQuality")),
      flexibility: asNullableNumber(form.get("flexibility")),
      valueForMoney: asNullableNumber(form.get("valueForMoney")),
      globalRating: asNullableNumber(form.get("globalRating")),
      repeatStatus: asNullableString(form.get("repeatStatus")),
      importantNotes: asNullableString(form.get("importantNotes")),
      followUp: asBoolean(form.get("followUp")),
      documentLinks: asNullableString(form.get("documentLinks")),
      gdprConsentForMedia: asBoolean(form.get("gdprConsentForMedia")),
      gdprConsentAt: asNullableDate(form.get("gdprConsentAt")),
    },
  });

  await logActivity({
    userId: user.id,
    action: "PROVIDER_UPDATED",
    entityType: EntityType.PROVIDER,
    entityId: provider.id,
    summary: provider.businessName,
    before: existing,
    after: provider,
  });

  return NextResponse.json(provider);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);

  const existing = await prisma.provider.findUnique({ where: { id: numericId } });
  if (!existing) {
    return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
  }
  if (existing.deletedAt) {
    return NextResponse.json({ error: "Proveedor ya archivado" }, { status: 409 });
  }

  const anonymizedProvider = await prisma.provider.update({
    where: { id: numericId },
    data: {
      businessName: `ANON-${numericId}`,
      contactName: null,
      phone: null,
      email: null,
      instagram: null,
      website: null,
      importantNotes: null,
      documentLinks: null,
      gdprConsentForMedia: false,
      gdprConsentAt: null,
      deletedAt: new Date(),
    },
  });

  await logActivity({
    userId: user.id,
    action: "PROVIDER_ANONYMIZED",
    entityType: EntityType.PROVIDER,
    entityId: numericId,
    summary: existing.businessName,
    before: existing,
    after: anonymizedProvider,
  });

  return NextResponse.json({ ok: true });
}
