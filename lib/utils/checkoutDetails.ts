export const PRINT_COLORS = [
  'Negro',
  'Blanco',
  'Gris',
  'Rojo',
  'Azul',
  'Celeste',
  'Verde',
  'Amarillo',
  'Naranja',
  'Rosa',
  'Transparente',
  'A consultar',
] as const

export const PRINT_MATERIALS = ['PLA', 'A consultar'] as const


export type CheckoutDetails = {
  color: string
  material: string
  delivery: 'retiro' | 'envio'
  zone?: string
  notes?: string
}

export function toCheckoutDetails(value: {
  color: string
  material: string
  delivery: '' | 'retiro' | 'envio'
  zone: string
  notes?: string
}): CheckoutDetails | null {
  if (!value.color || !value.material || !value.delivery) return null
  if (value.delivery === 'envio' && !value.zone.trim()) return null
  return {
    color: value.color,
    material: value.material,
    delivery: value.delivery,
    zone: value.zone.trim() || undefined,
    notes: value.notes,
  }
}

export function formatDeliveryLine(details: Pick<CheckoutDetails, 'delivery' | 'zone'>): string {
  if (details.delivery === 'retiro') return 'Retiro en Mar de Cobo'
  const zone = details.zone?.trim()
  return zone ? `Envío · ${zone}` : 'Envío a coordinar'
}

export function formatCheckoutNotes(details: CheckoutDetails): string {
  const lines = [
    `Color: ${details.color}`,
    `Material: ${details.material}`,
    `Entrega: ${formatDeliveryLine(details)}`,
  ]
  const extra = details.notes?.trim()
  if (extra) lines.push(extra)
  return lines.join('\n')
}
