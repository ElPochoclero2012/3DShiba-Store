import assert from 'node:assert/strict'
import { legacyOrderValue, missingNotNullColumn } from '../lib/utils/legacyOrderColumns.ts'

const known = {
  name: 'Ana',
  email: 'ana@test.com',
  notes: 'Zona centro',
  items: [{ id: '1' }],
}

assert.equal(
  missingNotNullColumn(
    'null value in column "shipping_address" of relation "orders" violates not-null constraint'
  ),
  'shipping_address'
)
assert.equal(missingNotNullColumn('something else'), null)
assert.equal(legacyOrderValue('shipping_address', known), 'Zona centro')
assert.equal(legacyOrderValue('customer_phone', { ...known, notes: '' }), '-')
assert.equal(legacyOrderValue('status', known), 'pending')
assert.equal(legacyOrderValue('payment_status', known), 'pending')
assert.equal(legacyOrderValue('customer_email', known), 'ana@test.com')
assert.deepEqual(legacyOrderValue('products', known), known.items)
assert.equal(legacyOrderValue('tax', known), 0)

console.log('legacyOrderColumns ok')
