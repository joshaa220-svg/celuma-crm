import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { decode } from "iconv-lite";
import { prisma } from "@/lib/prisma";

function parseSpanishDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  const text = value.trim();
  if (!text) {
    return null;
  }

  const parts = text.split("/");
  if (parts.length !== 3) {
    return null;
  }

  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseNumber(text: string | undefined): number | null {
  if (!text) {
    return null;
  }

  const clean = text.replace(/[€\s]/g, "").replace(",", ".").trim();
  if (!clean) {
    return null;
  }

  const value = Number(clean);
  return Number.isFinite(value) ? value : null;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió archivo CSV" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const csvText = decode(buffer, "latin1");

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    return NextResponse.json(
      {
        error: "Error parseando CSV",
        details: parsed.errors,
      },
      { status: 400 },
    );
  }

  const data = parsed.data
    .map((row) => ({
      contractedStatus: row["Contratado"]?.trim() || null,
      providerType: row["Tipo de proveedor"]?.trim() || "Otros",
      businessName: row["Nombre comercial"]?.trim() || "Proveedor sin nombre",
      contactName: row["Nombre de contacto"]?.trim() || null,
      phone: row["Teléfono"]?.trim() || null,
      email: row["E-mail"]?.trim() || null,
      instagram: row["Instagram"]?.trim() || null,
      website: row["Web"]?.trim() || null,
      zone: row["Zona"]?.trim() || null,
      servicesOffered: row["Servicios que ofrece"]?.trim() || null,
      minPrice: parseNumber(row["Precio mínimo orientativo"]),
      avgPrice: parseNumber(row["Precio medio"]),
      maxPrice: parseNumber(row["Precio máximo"]),
      specialConditions: row["Condiciones especiales"]?.trim() || null,
      availableDays: row["Días disponibles"]?.trim() || null,
      usualHours: row["Horarios habituales"]?.trim() || null,
      setupTime: row["Tiempo de montaje"]?.trim() || null,
      teardownTime: row["Tiempo de desmontaje"]?.trim() || null,
      technicalNeeds: row["Necesidades técnicas"]?.trim() || null,
      firstContactDate: parseSpanishDate(row["Fecha primer contacto"]),
      contactChannel: row["Vía de contacto"]?.trim() || null,
      initialResponse: row["Respuesta inicial"]?.trim() || null,
      hired: row["Contratado"]?.trim().toLowerCase() === "si",
      relationshipType: row["Tipo de relación"]?.trim() || null,
      agreedConditions: row["Condiciones acordadas"]?.trim() || null,
      professionalism: parseNumber(row["Profesionalidad"]),
      communication: parseNumber(row["Comunicación"]),
      punctuality: parseNumber(row["Puntualidad"]),
      serviceQuality: parseNumber(row["Calidad del servicio"]),
      flexibility: parseNumber(row["Flexibilidad"]),
      valueForMoney: parseNumber(row["Relación calidad-precio"]),
      globalRating: parseNumber(row["Valoración global"]),
      repeatStatus: row["Repetir"]?.trim() || null,
      followUp: row["Repetir"]?.trim().toLowerCase() === "si",
      importantNotes: row["Notas importantes"]?.trim() || null,
    }))
    .filter((row) => row.businessName && row.providerType);

  if (!data.length) {
    return NextResponse.json({ error: "El CSV no contiene filas válidas" }, { status: 400 });
  }

  await prisma.provider.createMany({ data });

  return NextResponse.json({ imported: data.length });
}
