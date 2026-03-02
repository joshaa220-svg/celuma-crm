import { NextRequest, NextResponse } from "next/server";
import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequestSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import { asNullableDate, asNullableInt, asNullableString } from "@/lib/crm";

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
  const form = await request.formData();

  const previous = await prisma.task.findUnique({ where: { id: numericId } });
  if (!previous) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  const status = (asNullableString(form.get("status")) as TaskStatus | null) ?? previous.status;
  const task = await prisma.task.update({
    where: { id: numericId },
    data: {
      title: asNullableString(form.get("title")) ?? previous.title,
      description: asNullableString(form.get("description")),
      dueDate: asNullableDate(form.get("dueDate")),
      status,
      priority: asNullableInt(form.get("priority")) ?? previous.priority,
      assignedToId: asNullableInt(form.get("assignedToId")) ?? previous.assignedToId,
      completedAt: status === TaskStatus.DONE ? new Date() : null,
    },
  });

  await logActivity({
    userId: user.id,
    action: "TASK_UPDATED",
    entityType: task.entityType ?? undefined,
    entityId: task.entityId ?? task.id,
    summary: task.title,
    before: previous,
    after: task,
  });

  return NextResponse.json(task);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);
  const task = await prisma.task.delete({ where: { id: numericId } });

  await logActivity({
    userId: user.id,
    action: "TASK_DELETED",
    entityType: task.entityType ?? undefined,
    entityId: task.entityId ?? task.id,
    summary: task.title,
    before: task,
  });

  return NextResponse.json({ ok: true });
}
