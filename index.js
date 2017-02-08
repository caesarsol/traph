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

const DATA_ATTRIBUTE = Symbol('TRAPH_DATA_ATTRIBUTE')

function buildGettifizeProto(obj) {
  const protoDefinitions = mapValues(obj, (k, fn) => ({
    enumerable: true,
    get() {
      const input = this[DATA_ATTRIBUTE]
      const output = this
      const value = fn(input, output)
      Object.defineProperty(this, k, { value, enumerable: true })
      return value
    },
  }))
  const proto = Object.defineProperties({}, protoDefinitions)
  return proto
}

function buildGettifizeBinder(proto) {
  return function bindData(input) {
    const inputProxy = checkerProxy(input)
    const output = Object.create(proto)
    Object.defineProperty(output, DATA_ATTRIBUTE, { value: inputProxy })
    return output
  }
}

/**
 * Gettifize: getter + memoize
 * Transforms an Object of functions of the form (input,output) => outputValue
 * in an Object of auto-memoizing getters deriving from input && output.
 */
function gettifize(obj) {
  const proto = buildGettifizeProto(obj)
  const binder = buildGettifizeBinder(proto)
  return binder
}

function materialize(t) {
  for (let k in t) { t[k] }
  return t
}

export default function traph(o) {
  const dataBinder = gettifize(o)
  const transform = (i) => materialize(dataBinder(i))
  transform.lazy = (i) => dataBinder(i)
  return transform
}
