export const PRINT_MATERIAL = 'PLA'

export type CheckoutDetails = {
  material: typeof PRINT_MATERIAL
  delivery: 'retiro' | 'envio'
  zone?: string
  notes?: string
}

export function toCheckoutDetails(value: {
  delivery: '' | 'retiro' | 'envio'
  zone: string
  notes?: string
}): CheckoutDetails | null {
  if (!value.delivery) return null
  if (value.delivery === 'envio' && !value.zone.trim()) return null
  return {
    material: PRINT_MATERIAL,
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
  const lines = [`Material: ${details.material}`, `Entrega: ${formatDeliveryLine(details)}`]
  const extra = details.notes?.trim()
  if (extra) lines.push(extra)
  return lines.join('\n')
}
