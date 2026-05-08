// src/util/fisher–yates.ts
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
// https://bost.ocks.org/mike/shuffle/compare.html
export const fisherYates = <T>(arr: T[]): T[] => {
  const res = [...arr]
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[res[i]!, res[j]!] = [res[j]!, res[i]!]
  }
  return res
}
