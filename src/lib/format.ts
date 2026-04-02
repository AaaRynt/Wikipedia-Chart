// src/lib/format.ts
export const formatKey = (str: string, isTitle: boolean) => {
  if (isTitle) return str.replace(/_/g, ' ')

  const res = str.replace(/[-_]/g, ' ')
  return res.charAt(0).toUpperCase() + res.slice(1)
}
