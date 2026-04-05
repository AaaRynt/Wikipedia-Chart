// src/data/keys.ts
import { Ri24HoursLine, RiAppsLine } from '@remixicon/react'
import {
  BugIcon,
  CalendarClockIcon,
  GlobeIcon,
  MonitorIcon,
  MonitorSmartphoneIcon,
  SearchCodeIcon,
  SmartphoneIcon,
  UserIcon,
} from 'lucide-react'
import type { TKey } from '@/data/types'

export const keys: TKey[] = [
  {
    label: 'granularity',
    value: ['daily', 'monthly'],
    svg: [Ri24HoursLine, CalendarClockIcon],
    align: 'start',
  },
  {
    label: 'access',
    value: ['all-access', 'desktop', 'mobile-app', 'mobile-web'],
    svg: [MonitorSmartphoneIcon, MonitorIcon, RiAppsLine, SmartphoneIcon],
    align: 'center',
  },
  {
    label: 'agent',
    value: ['all-agents', 'user', 'spider', 'automated'],
    svg: [GlobeIcon, UserIcon, SearchCodeIcon, BugIcon],
    align: 'end',
  },
]
