export const providerTypes = [
  "Decoración",
  "Foto",
  "Local",
  "Música",
  "Restaurante",
  "Catering",
  "Transporte",
  "Otros",
] as const;

export const contactChannels = ["Email", "Whatsapp", "Instagram", "Teléfono", "Web"] as const;

export const responseStates = ["Rápida", "No respondió", "Pendiente"] as const;

export const clientStatuses = ["Lead", "Contactado", "Presupuesto enviado", "Contratado", "Descartado"] as const;

export function asNullableString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const clean = value.trim();
  return clean.length ? clean : null;
}

export function asNullableNumber(value: FormDataEntryValue | null): number | null {
  const text = asNullableString(value);
  if (!text) {
    return null;
  }

  const normalized = text.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function asNullableInt(value: FormDataEntryValue | null): number | null {
  const parsed = asNullableNumber(value);
  if (parsed === null) {
    return null;
  }
  return Math.round(parsed);
}

export function asBoolean(value: FormDataEntryValue | null): boolean {
  if (typeof value !== "string") {
    return false;
  }
  return value === "true" || value === "on" || value === "1";
}

export function asNullableDate(value: FormDataEntryValue | null): Date | null {
  const text = asNullableString(value);
  if (!text) {
    return null;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
