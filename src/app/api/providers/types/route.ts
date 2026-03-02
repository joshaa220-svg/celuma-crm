import { NextRequest, NextResponse } from "next/server";
import { getRequestSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rows = await prisma.provider.findMany({
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
  });

  return NextResponse.json(rows.map((row) => row.providerType));
}
