type TraphConfig<I,O> = {
  [K in keyof O]: (i: I, o: O) => O[K]
}

interface TraphTransformer<I,O>  {
  (input: I): O
  lazy: (input: I) => O
}

declare function traph<I = Record<string,any>,O = Record<string,any>>(config: TraphConfig<I,O>): TraphTransformer<I,O>

export default traph
