// src/components/main/empty.tsx
import { InfoIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, Badge, CardContent } from '@/components/ui'
import { suggestions } from '@/data/suggestions'
import { fisherYates } from '@/util/fisher–yates'
import { formatKey } from '@/util/format'

export function Empty() {
  return (
    <CardContent className="flex h-full items-center justify-center">
      <Alert className="text-secondary-foreground bg-secondary m w-md shadow-xl">
        <InfoIcon />
        <AlertTitle>
          Please search for some article of&nbsp;
          <a href="https://www.wikipedia.org/" target="_blank" className="font-semibold no-underline! hover:underline!">
            WIKIPEDIA
          </a>
        </AlertTitle>
        <AlertDescription>
          <p>Or try these keyword below:</p>
          <ul className="grid list-disc grid-cols-2 gap-1">
            {fisherYates(suggestions)
              .slice(0, 10)
              .map((word) => (
                <li>
                  <Badge variant="outline" className="cursor-pointer">
                    <a href="" className="no-underline! hover:underline!">
                      {formatKey(word)}
                    </a>
                  </Badge>
                </li>
              ))}
          </ul>
        </AlertDescription>
      </Alert>
    </CardContent>
  )
}
