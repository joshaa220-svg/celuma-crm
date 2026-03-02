import { NextRequest, NextResponse } from "next/server";
import { EntityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequestSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import { asNullableDate, asNullableInt, asNullableString } from "@/lib/crm";

export async function GET(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const entityTypeRaw = request.nextUrl.searchParams.get("entityType");
  const entityIdRaw = Number(request.nextUrl.searchParams.get("entityId") ?? "0");

  if ((entityTypeRaw !== EntityType.PROVIDER && entityTypeRaw !== EntityType.CLIENT) || !entityIdRaw) {
    return NextResponse.json([]);
  }

  const notes = await prisma.note.findMany({
    where: {
      entityType: entityTypeRaw,
      entityId: entityIdRaw,
    },
    include: {
      createdBy: {
        select: { id: true, email: true, name: true },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json(notes);
}

export async function POST(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const entityTypeRaw = asNullableString(form.get("entityType"));
  const entityType =
    entityTypeRaw === EntityType.PROVIDER || entityTypeRaw === EntityType.CLIENT
      ? (entityTypeRaw as EntityType)
      : null;

  if (!entityType) {
    return NextResponse.json({ error: "EntityType inválido" }, { status: 400 });
  }

  const entityId = asNullableInt(form.get("entityId"));
  if (!entityId || entityId <= 0) {
    return NextResponse.json({ error: "EntityId inválido" }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      entityType,
      entityId,
      content: asNullableString(form.get("content")) ?? "",
      channel: asNullableString(form.get("channel")),
      contactAt: asNullableDate(form.get("contactAt")),
      createdById: user.id,
    },
    include: {
      createdBy: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  await logActivity({
    userId: user.id,
    action: "NOTE_CREATED",
    entityType,
    entityId: note.entityId,
    summary: note.content.slice(0, 120),
    after: note,
  });

  return NextResponse.json(note, { status: 201 });
}
