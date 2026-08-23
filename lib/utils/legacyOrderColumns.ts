export function missingNotNullColumn(message: string): string | null {
  const match = /null value in column "([^"]+)"/.exec(message)
  return match?.[1] ?? null
}

export function legacyOrderValue(
  column: string,
  known: { name: string; email: string; notes: string; items: unknown }
): string | number | unknown {
  if (/email/i.test(column)) return known.email
  if (/items|products/i.test(column)) return known.items
  if (/name/i.test(column)) return known.name
  if (/address|city|province|zip|postal|shipping|billing|delivery|country/i.test(column)) {
    return known.notes || 'A coordinar por WhatsApp'
  }
  if (/status/i.test(column)) return 'pending'
  if (/phone|whatsapp|tel|dni/i.test(column)) return '-'
  if (/total|price|amount|cost|qty|quantity|tax|subtotal/i.test(column)) return 0
  return known.notes || '-'
}
