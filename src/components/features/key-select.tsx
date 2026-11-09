import type { TKey } from '@/data/types'

// src/components/features/key-select.tsx
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui'
import { formatKey } from '@/lib/format'

export function KeySelect({ pKey, value, onValueChange }: { pKey: TKey; value?: string; onValueChange?: (value: string) => void }) {
  const selectedIndex = Math.max(0, pKey.value.indexOf(value ?? pKey.value[0]))
  const Icon = pKey.svg[selectedIndex]
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next !== null) onValueChange?.(next)
      }}
    >
      <SelectTrigger className="w-33 cursor-pointer">
        <SelectValue>
          <Icon className="text-muted-foreground" />
          {formatKey(value ?? pKey.value[0], false)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align={pKey.align}>
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
