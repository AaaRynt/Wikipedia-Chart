// src/components/layout/footer.tsx
import { DatePickerWithRange, KeySelect } from '@/components/features'
import { keys } from '@/data/keys'
export function Footer() {
  return (
    <footer className="flex justify-center gap-6 px-4 py-2">
      <DatePickerWithRange />
      <div className="flex gap-2">
        {keys.map((key) => (
          <KeySelect key={key.label} pKey={key} />
        ))}
      </div>
    </footer>
  )
}
