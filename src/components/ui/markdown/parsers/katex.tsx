import React, { useState } from 'react'
import {
  blockRegex,
  parseCaptureInline,
  Priority,
  simpleInlineRegex,
} from 'markdown-to-jsx'
import type { MarkdownToJSX } from 'markdown-to-jsx'
import type { FC } from 'react'

import { loadScript, loadStyleSheet } from '~/lib/load-script'

// @ts-ignore
const useInsertionEffect = React.useInsertionEffect || React.useEffect
//  $ c = \pm\sqrt{a^2 + b^2} $
export const KateXRule: MarkdownToJSX.Rule = {
  match: simpleInlineRegex(
    /^\$\s{0,}((?:\[.*?\]|<.*?>(?:.*?<.*?>)?|`.*?`|.)*?)\s{0,}\$/,
  ),
  order: Priority.LOW,
  parse: parseCaptureInline,
  react(node, _, state?) {
    try {
      const str = node.content.map((item: any) => item.content).join('')

      return <LateX key={state?.key}>{str}</LateX>
    } catch {
      return null as any
    }
  },
}

type LateXProps = {
  children: string
  mode?: string // If `display` the math will be rendered in display mode. Otherwise the math will be rendered in inline mode.
}

const LateX: FC<LateXProps> = (props) => {
  const { children, mode } = props

  const [html, setHtml] = useState('')

  const displayMode = mode === 'display'

  useInsertionEffect(() => {
    loadStyleSheet(
      'https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/KaTeX/0.15.2/katex.min.css',
    )
    loadScript(
      'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M/KaTeX/0.15.2/katex.min.js',
    ).then(() => {
      // @ts-ignore
      const html = window.katex.renderToString(children, { displayMode })
      setHtml(html)
    })
  }, [])

  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

export const KateXBlockRule: MarkdownToJSX.Rule = {
  match: blockRegex(
    new RegExp(`^\\s*\\$\\$ *(?<content>[\\s\\S]+?)\\s*\\$\\$ *(?:\n *)+\n?`),
  ),

  order: Priority.LOW,
  parse(capture) {
    return {
      type: 'kateXBlock',
      groups: capture.groups,
    }
  },
  react(node, _, state?) {
    return (
      <div key={state?.key}>
        <LateX mode="display">{node.groups.content}</LateX>
      </div>
    )
  },
}
