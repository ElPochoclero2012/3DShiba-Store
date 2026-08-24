import assert from 'node:assert/strict'
import {
  isProductStorageUrl,
  moveItem,
  storagePathFromUrl,
} from '../lib/utils/productImages.ts'

assert.equal(
  isProductStorageUrl(
    'https://abc.supabase.co/storage/v1/object/public/product-images/p/a.jpg'
  ),
  true
)
assert.equal(isProductStorageUrl('https://evil.example/foto.jpg'), false)
assert.equal(
  storagePathFromUrl(
    'https://abc.supabase.co/storage/v1/object/public/product-images/p%2Fa.jpg'
  ),
  'p/a.jpg'
)
assert.equal(storagePathFromUrl('https://cdn.example/x.jpg'), null)

assert.deepEqual(moveItem(['a', 'b', 'c'], 1, -1), ['b', 'a', 'c'])
assert.deepEqual(moveItem(['a', 'b', 'c'], 0, -1), ['a', 'b', 'c'])
assert.deepEqual(moveItem(['a', 'b', 'c'], 2, 1), ['a', 'b', 'c'])
assert.deepEqual(moveItem(['a', 'b', 'c'], 0, 1), ['b', 'a', 'c'])

console.log('productImages ok')
