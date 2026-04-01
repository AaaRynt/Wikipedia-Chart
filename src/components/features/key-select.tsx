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
import type { Tkey } from '@/data/types'

export function KeySelect({ pKey }: { pKey: Tkey }) {
  const Icon = pKey.svg[0]
  return (
    <Select>
      <SelectTrigger className="w-33 cursor-pointer">
        <SelectValue
          placeholder={
            <>
              <Icon className="text-muted-foreground" />
              {format(pKey.value[0])}
            </>
          }
        />
      </SelectTrigger>
      <SelectContent position="popper" align={pKey.align}>
        <SelectGroup>
          <SelectLabel>{format(pKey.label)}</SelectLabel>
          {pKey.value.map((value, index) => {
            const Icon = pKey.svg[index]
            return (
              <SelectItem key={value} value={value} className="flex items-center gap-2">
                <Icon className="text-muted-foreground" />
                {format(value)}
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
