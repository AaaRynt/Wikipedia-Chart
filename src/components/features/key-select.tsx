// src/components/features/key-select.tsx
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui'

export function KeySelect({
  keys,
  align,
}: {
  keys: { label: string; value: string[] }
  align: 'center' | 'start' | 'end' | undefined
}) {
  return (
    <Select>
      <SelectTrigger className="w-auto">
        <SelectValue placeholder={keys.value[0]} />
      </SelectTrigger>
      <SelectContent position="popper" align={align}>
        <SelectGroup>
          <SelectLabel>{keys.label}</SelectLabel>
          {keys.value.map((key) => (
            <SelectItem key={key} value={key}>
              {key}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
