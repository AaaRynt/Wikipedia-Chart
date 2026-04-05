// src/components/features/date-picker-with-range.tsx
'use client'
import { addDays, format } from 'date-fns'
import { CalendarRangeIcon } from 'lucide-react'
import * as React from 'react'
import { type DateRange } from 'react-day-picker'
import { Button, Calendar, Field, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'

const userLocale = navigator.language || 'en-US',
  defaultRange = {
    from: new Date(new Date().getFullYear(), 0, 20),
    to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
  }

export function DatePickerWithRange({
  value,
  onChange,
}: {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
}) {
  const [date, setDate] = React.useState<DateRange | undefined>(value ?? defaultRange)

  React.useEffect(() => {
    if (!value?.from && !value?.to) return
    setDate(value)
  }, [value, value?.from, value?.to])

  return (
    <Field className="w-60">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" id="date-picker-range" className="cursor-pointer justify-start font-normal">
            <CalendarRangeIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'yyyy, M/d')} - {format(date.to, 'yyyy, M/d')}
                </>
              ) : (
                format(date.from, 'yyyy, M/d')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            captionLayout="dropdown"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              setDate(range)
              onChange?.(range)
            }}
            numberOfMonths={2}
            startMonth={new Date(2015, 6)}
            endMonth={new Date(new Date().getFullYear(), new Date().getMonth())}
            formatters={{
              formatWeekdayName: (date) => date.toLocaleString(userLocale, { weekday: 'short' }),
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
