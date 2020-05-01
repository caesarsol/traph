import { expectType, expectAssignable, expectError } from "tsd"
import traph from "."

type Input = { in: number[] }
type Output = { out: number }

const stats = traph<Input, Output>({
  out: (i,o) => {
    expectType<Input>(i)
    expectType<Output>(o)
    return i.in.length
  }
})

expectAssignable<(i: Input) => Output>(stats)
expectType<(i: Input) => Output>(stats.lazy)

declare const data: Input
expectType<Output>(stats(data))

expectError(traph<Input,Output>({}))
expectError(traph<Input,Output>({out: "string value"}))
expectError(traph<Input,Output>({out: (i,o) => "string value"}))
