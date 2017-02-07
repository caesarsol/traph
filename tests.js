if (typeof traph === 'undefined') {
  var traph = require('.').default
}

/**
 * Object's and all its descendants' keys
 * (As opposed to Object.keys(), which gives only own keys)
 */
function objectInheritedKeys(obj) {
  const keys = []
  for (let k in obj) {
    keys.push(k)
  }
  return keys
}

const transform = traph({
  full: (i, o) => i.first + i.last,
  formal: (i, o) => o.full + ', born ' + i.birth.toISOString().split('T')[0],
})

const c = transform({
  first: 'caesar',
  last: 'sol',
  birth: new Date('1988-08-24'),
})

console.log(c, '=== { full: "caesarsol", formal: "caesarsol, born 1988-08-24"}')
console.log(JSON.stringify(c), '=== {"full":"caesarsol","formal":"caesarsol, born 1988-08-24"}')
console.log(objectInheritedKeys(c), '=== ["full", "formal"]')

const d = transform.lazy({
  first: 'puci',
  last: 'na',
  birth: new Date('1985-10-12'),
})

console.log(d, '=== {}')
console.log(JSON.stringify(d), '=== {}')
console.log(objectInheritedKeys(d), '=== ["full", "formal"]')

console.log('first call (will execute getters)')
console.time(1); console.log(d.formal); console.timeEnd(1)
console.log('subsequent calls (will use cached)')
console.time(2); console.log(d.formal); console.timeEnd(2)
console.time(3); console.log(d.formal); console.timeEnd(3)
console.time(4); console.log(d.formal); console.timeEnd(4)
