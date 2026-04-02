// src/data/keys.ts
import {
  Ri24HoursLine,
  RiCalendarScheduleLine,
  RiDeviceLine,
  RiComputerLine,
  RiAppsLine,
  RiSmartphoneLine,
  RiGlobalLine,
  RiSeoLine,
  RiBugLine,
  RiUserLine,
} from '@remixicon/react'
import type { Tkey } from '@/data/types'

export const keys: Tkey[] = [
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
