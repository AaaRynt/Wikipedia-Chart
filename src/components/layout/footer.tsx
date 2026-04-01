// src/components/layout/footer.tsx
import { DatePickerWithRange, KeySelect } from '@/components/features'
import { keys } from '@/data/keys'
export function Footer() {
  return (
    <footer className="justify-center">
      <div className="flex gap-6">
        <DatePickerWithRange />
        <div className="flex gap-2">
          {keys.map((key) => (
            <KeySelect keys={key} align={key.align} />
          ))}
        </div>
      </div>
    </footer>
  )
}
