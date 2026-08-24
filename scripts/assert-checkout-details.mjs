import assert from 'node:assert/strict'
import {
  formatCheckoutNotes,
  formatDeliveryLine,
  toCheckoutDetails,
} from '../lib/utils/checkoutDetails.ts'
assert.equal(toCheckoutDetails({ delivery: '', zone: '' }), null)
assert.equal(toCheckoutDetails({ delivery: 'envio', zone: '' }), null)
assert.deepEqual(toCheckoutDetails({ delivery: 'retiro', zone: '' }), {
  material: 'PLA',
  delivery: 'retiro',
  zone: undefined,
  notes: undefined,
})

assert.equal(formatDeliveryLine({ delivery: 'retiro' }), 'Retiro en Mar de Cobo')
assert.equal(
  formatDeliveryLine({ delivery: 'envio', zone: 'Mar del Plata' }),
  'Envío · Mar del Plata'
)

const notes = formatCheckoutNotes({
  material: 'PLA',
  delivery: 'retiro',
  notes: 'Color rojo, sin soportes a la vista',
})
assert.match(notes, /Material: PLA/)
assert.match(notes, /Retiro en Mar de Cobo/)
assert.match(notes, /Color rojo/)
assert.doesNotMatch(notes, /^Color:/m)

console.log('checkoutDetails ok')
