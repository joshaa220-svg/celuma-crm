import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { asNullableDate, asNullableInt, asNullableNumber, asNullableString } from "@/lib/crm";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const status = request.nextUrl.searchParams.get("status")?.trim() ?? "";
  const pageParam = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSizeParam = Number(request.nextUrl.searchParams.get("pageSize") ?? "30");

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const pageSize = Math.min(30, Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.floor(pageSizeParam) : 30);
  const skip = (page - 1) * pageSize;

  const where = {
    AND: [
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
  const form = await request.formData();

  const client = await prisma.client.create({
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

  return NextResponse.json(client, { status: 201 });
}
