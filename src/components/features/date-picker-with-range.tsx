// src/components/features/date-picker-with-range.tsx
'use client'

import * as React from 'react'
import { addDays, format } from 'date-fns'
import { RiCalendar2Line } from '@remixicon/react'
import { type DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const userLocale = navigator.language || 'en-US'

export function DatePickerWithRange() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 20),
    to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
  })

  return (
    <Field className="mx-auto w-60">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" id="date-picker-range" className="cursor-pointer justify-start font-normal">
            <RiCalendar2Line />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'yyyy, M/d')} - {format(date.to, 'yyyy, M/d')}
                </>
              ) : (
                format(date.from, 'yyyy M/d')
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
            onSelect={setDate}
            numberOfMonths={2}
            startMonth={new Date(2015, 6)}
            endMonth={new Date()}
            formatters={{
              formatWeekdayName: (date) => date.toLocaleString(userLocale, { weekday: 'short' }),
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
