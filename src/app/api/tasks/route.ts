import { NextRequest, NextResponse } from "next/server";
import { EntityType, TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequestSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import { asNullableDate, asNullableInt, asNullableString } from "@/lib/crm";

export async function GET(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const status = request.nextUrl.searchParams.get("status")?.trim() ?? "";

  const tasks = await prisma.task.findMany({
    where: {
      AND: [
        status ? { status: status as TaskStatus } : {},
        search
          ? {
              OR: [{ title: { contains: search } }, { description: { contains: search } }],
            }
          : {},
      ],
    },
    include: {
      createdBy: { select: { id: true, email: true, name: true } },
      assignedTo: { select: { id: true, email: true, name: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const status = (asNullableString(form.get("status")) as TaskStatus | null) ?? TaskStatus.PENDING;
  const entityTypeRaw = asNullableString(form.get("entityType"));
  const entityType =
    entityTypeRaw === EntityType.PROVIDER || entityTypeRaw === EntityType.CLIENT
      ? (entityTypeRaw as EntityType)
      : null;

  const task = await prisma.task.create({
    data: {
      title: asNullableString(form.get("title")) ?? "Tarea sin título",
      description: asNullableString(form.get("description")),
      dueDate: asNullableDate(form.get("dueDate")),
      status,
      priority: asNullableInt(form.get("priority")) ?? 2,
      entityType,
      entityId: asNullableInt(form.get("entityId")),
      createdById: user.id,
      assignedToId: asNullableInt(form.get("assignedToId")) ?? user.id,
      completedAt: status === TaskStatus.DONE ? new Date() : null,
    },
  });

  await logActivity({
    userId: user.id,
    action: "TASK_CREATED",
    entityType: task.entityType ?? undefined,
    entityId: task.entityId ?? task.id,
    summary: task.title,
    after: task,
  });

  return NextResponse.json(task, { status: 201 });
}
