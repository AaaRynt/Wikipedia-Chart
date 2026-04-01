// src/components/features/key-select.tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from '@/lib/format'

export function KeySelect({
  keys,
  align,
}: {
  keys: { label: string; value: string[] }
  align: 'center' | 'start' | 'end' | undefined
}) {
  return (
    <Select>
      <SelectTrigger className="w-auto cursor-pointer">
        <SelectValue placeholder={format(keys.value[0])} />
      </SelectTrigger>
      <SelectContent position="popper" align={align}>
        <SelectGroup>
          <SelectLabel>{format(keys.label)}</SelectLabel>
          {keys.value.map((value) => (
            <SelectItem key={value} value={value}>
              {format(value)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
