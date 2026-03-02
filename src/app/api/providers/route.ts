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

export async function GET(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const providerType = request.nextUrl.searchParams.get("providerType")?.trim() ?? "";
  const pageParam = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSizeParam = Number(request.nextUrl.searchParams.get("pageSize") ?? "30");

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const pageSize = Math.min(30, Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.floor(pageSizeParam) : 30);
  const skip = (page - 1) * pageSize;

  const where = {
    AND: [
      { deletedAt: null },
      providerType ? { providerType } : {},
      search
        ? {
            OR: [
              { businessName: { contains: search } },
              { contactName: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
              { zone: { contains: search } },
              { servicesOffered: { contains: search } },
              { importantNotes: { contains: search } },
            ],
          }
        : {},
    ],
  };

  const [providers, total, types] = await Promise.all([
    prisma.provider.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.provider.count({ where }),
    prisma.provider.findMany({
      distinct: ["providerType"],
      where: {
        deletedAt: null,
        providerType: {
          not: "",
        },
      },
      select: {
        providerType: true,
      },
      orderBy: {
        providerType: "asc",
      },
    }),
  ]);

  return NextResponse.json({
    items: providers,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    availableTypes: types.map((item) => item.providerType),
  });
}

export async function POST(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const providerType = asNullableString(form.get("providerType")) ?? "Otros";
  const businessName = asNullableString(form.get("businessName")) ?? "Proveedor sin nombre";
  const phone = asNullableString(form.get("phone"));
  const email = asNullableString(form.get("email"));

  const duplicateOr: Array<Record<string, string>> = [{ businessName }];
  if (phone) duplicateOr.push({ phone });
  if (email) duplicateOr.push({ email });

  const duplicate = await prisma.provider.findFirst({
    where: {
      deletedAt: null,
      OR: duplicateOr,
    },
    select: { id: true, businessName: true, email: true, phone: true },
  });

  if (duplicate) {
    return NextResponse.json(
      { error: "Proveedor duplicado", duplicate },
      { status: 409 },
    );
  }

  const provider = await prisma.provider.create({
    data: {
      providerType,
      businessName,
      contactName: asNullableString(form.get("contactName")),
      phone,
      email,
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

  const noteContent = asNullableString(form.get("noteContent"));
  if (noteContent) {
    await prisma.note.create({
      data: {
        entityType: EntityType.PROVIDER,
        entityId: provider.id,
        content: noteContent,
        channel: asNullableString(form.get("noteChannel")),
        contactAt: asNullableDate(form.get("noteContactAt")),
        createdById: user.id,
      },
    });
  }

  await logActivity({
    userId: user.id,
    action: "PROVIDER_CREATED",
    entityType: EntityType.PROVIDER,
    entityId: provider.id,
    summary: provider.businessName,
    after: provider,
  });

  return NextResponse.json(provider, { status: 201 });
}
