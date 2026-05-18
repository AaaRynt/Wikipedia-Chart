// src/lib/format.ts
export const formatKey = (str: string, isTitle: boolean = true) => {
  let res: string
  if (isTitle) res = str.replace(/_/g, ' ')
  else res = str.replace(/[-_]/g, ' ')
  return res
}
