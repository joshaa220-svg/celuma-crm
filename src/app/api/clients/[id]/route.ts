import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { asNullableDate, asNullableInt, asNullableNumber, asNullableString } from "@/lib/crm";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const numericId = Number(id);
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
    },
  });

  return NextResponse.json(client);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const numericId = Number(id);

  await prisma.client.delete({ where: { id: numericId } });
  return NextResponse.json({ ok: true });
}
