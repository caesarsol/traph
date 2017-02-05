function mapValues(obj, fn) {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    const r = fn(k, v)
    if (r === undefined) return
    acc[k] = r
    return acc
  }, {})
}

/**
 * A proxy for an Object that checks for existence of the keys,
 * and throws an error in case.
 */
function checkerProxy(data) {
  if (Proxy === undefined) {
    console.warn("Can't validate input data Object, because we need Proxy!")
    return data
  }
  return new Proxy(data, {
    get(target, key) {
      if (key in target) {
        return target[key]
      } else {
        throw new Error(`Data object is missing key '${key}':`)
      }
    },
  })
}

/**
 * Gettifize: getter + memoize
 * Transforms an Object of functions (input,output) => outputValue
 * in an Object of getters with closured 'input' and gettifized 'output'.
 */
function gettifize(obj, data) {
  const dataProxy = checkerProxy(data)
  const protoDefinitions = mapValues(obj, (k, fn) => ({
    enumerable: true,
    get() {
      const value = fn(dataProxy, this)
      Object.defineProperty(this, k, { value, enumerable: true })
      return value
    },
  }))
  const proto = Object.defineProperties({}, protoDefinitions)
  const gettifized = Object.create(proto)
  return gettifized
}

function materialize(t) {
  const keys = Object.keys(Object.getPrototypeOf(t))
  keys.forEach(k => t[k])
  // Alternative:
  // for (let k in t) { t[k] }
  return t
}

export default function traph(o) {
  const transform = (i) => materialize(gettifize(o, i))
  transform.lazy = (i) => gettifize(o, i)
  return transform
}
