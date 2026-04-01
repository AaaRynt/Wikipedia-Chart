// src/lib/read.ts
export const format = (str: string) => {
  const res = str.replace(/[-_]/g, ' ')
  return res.charAt(0).toUpperCase() + res.slice(1)
}
