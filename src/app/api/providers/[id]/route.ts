import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
  const { id } = await params;
  const numericId = Number(id);
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
    },
  });

  return NextResponse.json(provider);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const numericId = Number(id);

  await prisma.provider.delete({ where: { id: numericId } });
  return NextResponse.json({ ok: true });
}
