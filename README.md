# traph

This is **traph** (**tr**ansformation gr**aph**), a JavaScript mini-library to declaratively transform an Object in another using pure transformation functions.

Inspired from the wonderful [`graph`](http://plumatic.github.io/prismatics-graph-at-strange-loop) utility of the [`plumbing`](https://github.com/plumatic/plumbing) clojure library.

## Usage

We will examine an ordinary transformation function and then its `traph` equivalent.

Here's an old-style function definition:

```js
function stats (input) {
  const { values } = input
  if (!values) throw new Error('No property "values"!')

  const count = values.length
  const mean = values.reduce(sum) / count
  const meanSquare = values.map(square).reduce(sum) / count
  const variance = meanSquare - square(mean)
  const output = {
    count,
    mean,
    meanSquare,
    variance,
  }
  return output
}

function sum (a, b) { return a + b }
function square (a) { return a * a }

const data = { values: [1,2,3,4,5,6,7] }
const transformed = stats(data)
console.log(transformed)
// -> Object {count: 7, mean: 4, meanSquare: 20, variance: 4}
```

These computations are hiding a data graph:

```
{ values } --> { count, mean, meanSquare, variance }

   .-------------------------.
   .                         v
values --------> count ----> mean -------.
   '              '--------> meanSquare -'--> variance
   '-------------------------^
```

The dependencies are expressed as the order of the variables,
an approach which has its liabilities: if you simply exchange the definitions of `variance` and `meanSquare` the function explodes.

Using `traph`, we can refactor `stats` to this very readable, robust and structured form, using a map from keywords to keyword functions:

```js
import traph from 'traph'

const stats = traph({
  count:      (i, o) => i.values.length,
  variance:   (i, o) => o.meanSquare - square(o.mean),
  mean:       (i, o) => i.values.reduce(sum) / o.count,
  meanSquare: (i, o) => i.values.map(square).reduce(sum) / o.count,
})

const data = { values: [1,2,3,4,5,6,7] }
const transformed = stats(data)
console.log(transformed)
// -> Object {count: 7, meanSquare: 20, mean: 4, variance: 4}
```

Every output value is expressed with an arrow function, where the `i` and `o` parameters represent *input* (`data`) and *output* (the future returned object) respectively.

We can express output values in function of other output values, `traph` will understand the underlying graph and execute the statements in the right order!

Moreover, each micro-function in the object values is executed exacly once, and the result cached for next calls. (You can verify this by logging from inside the arrow functions)

This is why the given functions need to be **pure**.

## Validation

A `traph` automatically validates input data, and throws if a property on `input` is non-existant.

## Laziness

Sometimes we define a heavy computation, rich of all the data we might need, but somewhere we need only a subset of these.

For these cases we have `.lazy`.

For example, suppose we only need the `mean` of our data:

```js
const data = { values: [1,2,3,4,5,6,7] }
const transformed = stats.lazy(data)

// The object is initially empty:
console.log(transformed)
// -> Object {}

// We materialize computations as they are needed:
console.log(transformed.mean)
// -> 4

// The results are then attached to the object,
// but anything we don't need is not computed:
console.log(transformed)
// -> Object {count: 7, mean: 4}
```

This is possible thanks to a clever trick using prototype getters.

We don't recommend using lazy objects to feed data to other libraries, since an enumeration of the lazy object keys would give different results depending on the technique used.

The trick is mainly useful (and has no risks) if you get the result inline:

```
const mean = stats.lazy(data).mean
```

This guarantees to execute the minimum of necessary steps to get the result.

## TODO

 + Validation of outputs, when called fron inside the prop function
 + Better validation of inputs, if needed, maybe using JSON schemas
 + Get near the extensibility and composability of `plumbing/graph`:

   > We can also have higher-order functions on Graphs to wrap the behavior on each step.
   > For instance, we can automatically profile each sub-function in 'stats' to see how long it takes to execute.

## License

This software is distributed under the MIT license.
