import assert from 'node:assert/strict'
import {
  formatCheckoutNotes,
  formatDeliveryLine,
  toCheckoutDetails,
} from '../lib/utils/checkoutDetails.ts'
assert.equal(toCheckoutDetails({ color: '', material: 'PLA', delivery: 'retiro', zone: '' }), null)
assert.equal(toCheckoutDetails({ color: 'Negro', material: 'PLA', delivery: '', zone: '' }), null)
assert.equal(
  toCheckoutDetails({ color: 'Negro', material: 'PLA', delivery: 'envio', zone: '' }),
  null
)
assert.deepEqual(
  toCheckoutDetails({ color: 'Negro', material: 'PLA', delivery: 'retiro', zone: '' }),
  { color: 'Negro', material: 'PLA', delivery: 'retiro', zone: undefined, notes: undefined }
)

assert.equal(formatDeliveryLine({ delivery: 'retiro' }), 'Retiro en Mar de Cobo')
assert.equal(
  formatDeliveryLine({ delivery: 'envio', zone: 'Mar del Plata' }),
  'Envío · Mar del Plata'
)

const notes = formatCheckoutNotes({
  color: 'Negro',
  material: 'PLA',
  delivery: 'retiro',
  notes: 'Sin soportes a la vista',
})
assert.match(notes, /Color: Negro/)
assert.match(notes, /Retiro en Mar de Cobo/)
assert.match(notes, /Sin soportes/)

console.log('checkoutDetails ok')
