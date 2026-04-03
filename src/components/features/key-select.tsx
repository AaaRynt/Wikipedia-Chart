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
import { formatKey } from '@/lib/format'
import type { Tkey } from '@/data/types'

export function KeySelect({
  pKey,
  value,
  onValueChange,
}: {
  pKey: Tkey
  value?: string
  onValueChange?: (value: string) => void
}) {
  const Icon = pKey.svg[0]
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-33 cursor-pointer">
        <SelectValue
          placeholder={
            <>
              <Icon className="text-muted-foreground" />
              {formatKey(pKey.value[0], false)}
            </>
          }
        />
      </SelectTrigger>
      <SelectContent position="popper" align={pKey.align}>
        <SelectGroup>
          <SelectLabel>{formatKey(pKey.label, false)}</SelectLabel>
          {pKey.value.map((value, index) => {
            const Icon = pKey.svg[index]
            return (
              <SelectItem key={value} value={value} className="flex items-center gap-2">
                <Icon className="text-muted-foreground" />
                {formatKey(value, false)}
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
