// src/data/keys.ts
import {
  Ri24HoursLine,
  RiAppsLine,
  RiBugLine,
  RiCalendarScheduleLine,
  RiComputerLine,
  RiDeviceLine,
  RiGlobalLine,
  RiSeoLine,
  RiSmartphoneLine,
  RiUserLine,
} from '@remixicon/react'
import type { TKey } from '@/data/types'

export const keys: TKey[] = [
  {
    label: 'granularity',
    value: ['daily', 'monthly'],
    svg: [Ri24HoursLine, RiCalendarScheduleLine],
    align: 'start',
  },
  {
    label: 'access',
    value: ['all-access', 'desktop', 'mobile-app', 'mobile-web'],
    svg: [RiDeviceLine, RiComputerLine, RiAppsLine, RiSmartphoneLine],
    align: 'center',
  },
  {
    label: 'agent',
    value: ['all-agents', 'user', 'spider', 'automated'],
    svg: [RiGlobalLine, RiUserLine, RiSeoLine, RiBugLine],
    align: 'end',
  },
]
