import assert from 'node:assert/strict'
import { isOrderStatus, parseOrderStatus } from '../lib/utils/orderStatus.ts'
import { missingSchemaColumn } from '../lib/utils/legacyOrderColumns.ts'

assert.equal(parseOrderStatus('processing'), 'processing')
assert.equal(parseOrderStatus('paid'), 'pending')
assert.equal(isOrderStatus('shipped'), true)
assert.equal(isOrderStatus('nuevo'), false)
assert.equal(
  missingSchemaColumn("Could not find the 'fulfillment_status' column of 'orders' in the schema cache"),
  'fulfillment_status'
)

console.log('orderStatus ok')
