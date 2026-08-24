import assert from 'node:assert/strict'
import { isProductStorageUrl, storagePathFromUrl } from '../lib/utils/productImages.ts'

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

console.log('productImages ok')
