import test from 'ava'
import traph from './index'

/**
 * Object's own enumerable keys, without ancestors', sorted.
 */
function objectOwnKeys (obj) {
  return Object.keys(obj).sort()
}

/**
 * Object's and all its ancestors' enumerable keys, sorted.
 */
function objectAllKeys (obj) {
  const keys = []
  for (let k in obj) {
    keys.push(k)
  }
  keys.sort()
  return keys
}

test('traph with only input', t => {
  const transform = traph({
    fullName: i => `${i.first} ${i.last}`,
    initials: i => `${i.first[0].toUpperCase()}.${i.last[0].toUpperCase()}.`,
  })

  const output = transform({ first: 'Richard', last: 'Feynman' })

  t.deepEqual(output, { fullName: 'Richard Feynman', initials: 'R.F.' })
  t.deepEqual(objectAllKeys(output), ['fullName', 'initials'])
})

test('traph with output also', t => {
  const transform = traph({
    fullName: i => `${i.first} ${i.last}`,
    firstInitial: i => i.first[0].toUpperCase(),
    lastInitial: i => i.last[0].toUpperCase(),
    initials: (i, o) => `${o.firstInitial}.${o.lastInitial}.`,
    fullNameBirth: (i, o) => `${o.fullName}, born ${i.birth}`,
  })

  const output = transform({ first: 'Richard', last: 'Feynman', birth: 'May 11, 1918' })

  t.true(output.fullNameBirth === 'Richard Feynman, born May 11, 1918')
  t.true(output.initials === 'R.F.')
  t.deepEqual(objectAllKeys(output), ['firstInitial', 'fullName', 'fullNameBirth', 'initials', 'lastInitial'])
})

test('traph lazy', t => {
  const transform = traph({
    fullName: i => `${i.first} ${i.last}`,
    firstInitial: i => i.first[0].toUpperCase(),
    lastInitial: i => i.last[0].toUpperCase(),
    initials: (i, o) => `${o.firstInitial}.${o.lastInitial}.`,
    fullNameBirth: (i, o) => `${o.fullName}, born ${i.birth}`,
  })

  const output = transform.lazy({ first: 'Richard', last: 'Feynman', birth: 'May 11, 1918' })

  t.deepEqual(objectOwnKeys(output), [])
  t.deepEqual(objectAllKeys(output), ['firstInitial', 'fullName', 'fullNameBirth', 'initials', 'lastInitial'])

  // Execute getter
  t.true(output.fullName === 'Richard Feynman')

  t.deepEqual(objectOwnKeys(output), ['fullName'])
  t.deepEqual(objectAllKeys(output), ['firstInitial', 'fullName', 'fullNameBirth', 'initials', 'lastInitial'])

  // Execute getter
  t.true(output.initials === 'R.F.')

  t.deepEqual(objectOwnKeys(output), ['firstInitial', 'fullName', 'initials', 'lastInitial'])
  t.deepEqual(objectAllKeys(output), ['firstInitial', 'fullName', 'fullNameBirth', 'initials', 'lastInitial'])

  // Execute getter
  t.true(output.fullNameBirth === 'Richard Feynman, born May 11, 1918')

  t.deepEqual(objectOwnKeys(output), objectAllKeys(output))
})

test('traph doesn\'t use Proxy if not available', t => {
  const origProxy = global.Proxy
  delete global.Proxy

  const transform = traph({
    fullName: i => `${i.first} ${i.xxx}`,
  })
  const output = transform.lazy({ first: 'Richard', last: 'Feynman' })

  t.true(output.fullName === 'Richard undefined')

  global.Proxy = origProxy
})
