import { PRINT_COLORS } from '@/lib/utils/checkoutDetails'

export type CheckoutDraft = {
  color: string
  delivery: '' | 'retiro' | 'envio'
  zone: string
  notes: string
}

type Props = {
  value: CheckoutDraft
  onChange: (value: CheckoutDraft) => void
}

function chipClass(active: boolean) {
  return `rounded-full px-3 py-1.5 text-sm font-medium ${
    active
      ? 'bg-shiba text-white'
      : 'border border-line bg-background text-ink hover:border-shiba/50'
  }`
}

export default function CheckoutOptions({ value, onChange }: Props) {
  const set = (patch: Partial<CheckoutDraft>) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-ink">Color</p>
        <p className="mt-0.5 text-xs text-muted">
          Imprimimos en PLA. Si hay más de un color, aclaralo en las notas.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRINT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => set({ color })}
              className={chipClass(value.color === color)}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink">Entrega</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => set({ delivery: 'retiro' })}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium ${
              value.delivery === 'retiro'
                ? 'bg-shiba text-white'
                : 'border border-line bg-background text-ink hover:border-shiba/50'
            }`}
          >
            Retiro
          </button>
          <button
            type="button"
            onClick={() => set({ delivery: 'envio' })}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium ${
              value.delivery === 'envio'
                ? 'bg-shiba text-white'
                : 'border border-line bg-background text-ink hover:border-shiba/50'
            }`}
          >
            Envío
          </button>
        </div>
        {value.delivery === 'envio' && (
          <label className="mt-2 block text-sm font-medium text-ink">
            Zona o localidad
            <input
              value={value.zone}
              onChange={(event) => set({ zone: event.target.value })}
              placeholder="Ej. Mar del Plata, Centro"
              className="mt-1 w-full rounded-xl border border-line bg-background p-2.5 text-sm"
            />
          </label>
        )}
        {value.delivery === 'retiro' && (
          <p className="mt-2 text-sm text-muted">Retiro en Mar de Cobo, a coordinar.</p>
        )}
      </div>

      <label className="block text-sm font-medium text-ink">
        Notas para el pedido
        <textarea
          value={value.notes}
          onChange={(event) => set({ notes: event.target.value })}
          rows={3}
          placeholder="Soportes, tamaño, alguna aclaración..."
          className="mt-1 w-full rounded-xl border border-line bg-background p-3 text-sm"
        />
      </label>
    </div>
  )
}
