// src/components/main/empty.tsx
import { RiInformationLine } from '@remixicon/react'
import { Alert, AlertDescription, AlertTitle, Badge, CardContent } from '@/components/ui'
import { suggestions } from '@/data/suggestions'
import { fisherYates } from '@/util/fisher–yates'

export function Empty() {
  return (
    <CardContent className="flex h-full items-center justify-center">
      <Alert className="text-secondary-foreground bg-secondary m w-md shadow-xl">
        <RiInformationLine />
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
                      {word}
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
