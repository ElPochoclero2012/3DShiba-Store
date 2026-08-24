export const ORDER_STATUSES = ['pending', 'processing', 'completed', 'shipped'] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completado',
  shipped: 'Enviado',
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value)
}

export function parseOrderStatus(value: unknown): OrderStatus {
  return typeof value === 'string' && isOrderStatus(value) ? value : 'pending'
}

export function isUnseenOrder(order: {
  seen_at: string | null
  fulfillment_status: OrderStatus
}) {
  return !order.seen_at && order.fulfillment_status === 'pending'
}
