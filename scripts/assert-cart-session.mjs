import assert from 'node:assert/strict'
import { applyCartSession } from '../lib/store/cartSession.ts'

const item = { id: '1', name: 'Mate', price: 10, quantity: 1, image_url: null }
const other = { id: '2', name: 'Vaso', price: 20, quantity: 2, image_url: null }

let state = applyCartSession({ knownUserId: 'ana', visible: [item], vault: {} }, null)
assert.equal(state.visible.length, 0)
assert.equal(state.vault.ana[0]?.id, '1')

state = applyCartSession(state, 'ana')
assert.equal(state.visible[0]?.id, '1')

state = applyCartSession({ knownUserId: undefined, visible: [item], vault: {} }, 'ana')
assert.equal(state.visible[0]?.id, '1')
assert.equal(state.vault.ana[0]?.id, '1')

state = applyCartSession({ knownUserId: undefined, visible: [item], vault: {} }, null)
assert.equal(state.visible.length, 0)
assert.equal(Object.keys(state.vault).length, 0)

state = applyCartSession(
  { knownUserId: 'ana', visible: [item], vault: { beto: [other] } },
  'beto'
)
assert.equal(state.visible[0]?.id, '2')
assert.equal(state.vault.ana[0]?.id, '1')

const same = applyCartSession(state, 'beto')
assert.equal(same, state)

console.log('cartSession ok')
