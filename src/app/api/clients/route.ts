import { NextRequest, NextResponse } from "next/server";
import { EntityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequestSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import { asNullableDate, asNullableInt, asNullableNumber, asNullableString } from "@/lib/crm";

export async function GET(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const status = request.nextUrl.searchParams.get("status")?.trim() ?? "";
  const pageParam = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSizeParam = Number(request.nextUrl.searchParams.get("pageSize") ?? "30");

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const pageSize = Math.min(30, Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.floor(pageSizeParam) : 30);
  const skip = (page - 1) * pageSize;

  const where = {
    AND: [
      { deletedAt: null },
      status ? { status } : {},
      search
        ? {
            OR: [
              { fullName: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
              { eventType: { contains: search } },
              { eventLocation: { contains: search } },
              { notes: { contains: search } },
            ],
          }
        : {},
    ],
  };

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({
    items: clients,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function POST(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const fullName = asNullableString(form.get("fullName")) ?? "Cliente sin nombre";
  const phone = asNullableString(form.get("phone"));
  const email = asNullableString(form.get("email"));

  const duplicateOr: Array<Record<string, string>> = [{ fullName }];
  if (phone) duplicateOr.push({ phone });
  if (email) duplicateOr.push({ email });

  const duplicate = await prisma.client.findFirst({
    where: {
      deletedAt: null,
      OR: duplicateOr,
    },
    select: { id: true, fullName: true, email: true, phone: true },
  });

  if (duplicate) {
    return NextResponse.json(
      { error: "Cliente duplicado", duplicate },
      { status: 409 },
    );
  }

  const client = await prisma.client.create({
    data: {
      fullName,
      phone,
      email,
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

  const noteContent = asNullableString(form.get("noteContent"));
  if (noteContent) {
    await prisma.note.create({
      data: {
        entityType: EntityType.CLIENT,
        entityId: client.id,
        content: noteContent,
        channel: asNullableString(form.get("noteChannel")),
        contactAt: asNullableDate(form.get("noteContactAt")),
        createdById: user.id,
      },
    });
  }

  await logActivity({
    userId: user.id,
    action: "CLIENT_CREATED",
    entityType: EntityType.CLIENT,
    entityId: client.id,
    summary: client.fullName,
    after: client,
  });

  return NextResponse.json(client, { status: 201 });
}
