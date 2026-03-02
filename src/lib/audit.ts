import { EntityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ActivityInput = {
  userId?: number;
  action: string;
  entityType?: EntityType;
  entityId?: number;
  summary?: string;
  before?: unknown;
  after?: unknown;
};

export async function logActivity(input: ActivityInput): Promise<void> {
  await prisma.activityLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      beforeJson: input.before ? JSON.stringify(input.before) : null,
      afterJson: input.after ? JSON.stringify(input.after) : null,
    },
  });
}
