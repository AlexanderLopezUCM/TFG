// located at src/modules/shared/components/root-style-registry/index.tsx in my case

'use client'
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs'
import { useServerInsertedHTML } from 'next/navigation'
import { useState, type PropsWithChildren } from 'react'

export const RootStyleRegistry = ({ children }: PropsWithChildren) => {
  const [cache] = useState(() => createCache())

  useServerInsertedHTML(() => {
    return (
      <script
         dangerouslySetInnerHTML={{
          __html: `</script>${extractStyle(cache)}<script>`,
        }}
      />
    )
   })

   return <StyleProvider cache={cache}>{children}</StyleProvider>
}