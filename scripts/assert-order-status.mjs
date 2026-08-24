import assert from 'node:assert/strict'
import { isOrderStatus, isUnseenOrder, parseOrderStatus } from '../lib/utils/orderStatus.ts'
import { missingSchemaColumn } from '../lib/utils/legacyOrderColumns.ts'

assert.equal(parseOrderStatus('processing'), 'processing')
assert.equal(parseOrderStatus('paid'), 'pending')
assert.equal(isOrderStatus('shipped'), true)
assert.equal(isOrderStatus('nuevo'), false)
assert.equal(
  isUnseenOrder({ seen_at: null, fulfillment_status: 'pending' }),
  true
)
assert.equal(
  isUnseenOrder({ seen_at: '2026-08-24T12:00:00.000Z', fulfillment_status: 'pending' }),
  false
)
assert.equal(
  isUnseenOrder({ seen_at: null, fulfillment_status: 'completed' }),
  false
)
assert.equal(
  missingSchemaColumn("Could not find the 'fulfillment_status' column of 'orders' in the schema cache"),
  'fulfillment_status'
)

console.log('orderStatus ok')
