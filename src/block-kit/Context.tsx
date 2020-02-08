/** @jsx JSXSlack.h */
import { ContextBlock, ImageElement, MrkdwnElement } from '@slack/types'
import html from '../html'
import { JSXSlack } from '../jsx'
import { ObjectOutput } from '../utils'
import { mrkdwnSymbol } from './composition/Mrkdwn'
import { mrkdwn } from './composition/utils'
import { BlockComponentProps } from './Blocks'

type ContextElement = ImageElement | MrkdwnElement

const endSymbol = Symbol('EndOfContext')

export const Context: JSXSlack.FC<BlockComponentProps & {
  children: JSXSlack.Children<{}>
}> = ({ blockId, children, id }) => {
  const elements: ContextElement[] = []
  let current: (string | JSXSlack.Node)[] = []

  for (const child of [...JSXSlack.normalizeChildren(children), endSymbol]) {
    const independentElement: ContextElement | undefined = (() => {
      if (typeof child !== 'object') return undefined

      const { props } = child

      // <span> intrinsic HTML element
      if (child.type === 'span') return mrkdwn(html(child), true)

      // <img> intrinsic HTML element
      if (child.type === 'img')
        return {
          type: 'image' as const,
          image_url: props.src,
          alt_text: props.alt,
        }

      if (child.type === JSXSlack.NodeType.object) {
        // A converted <Image> component
        if (props.type === 'image')
          return {
            type: 'image' as const,
            image_url: props.image_url,
            alt_text: props.alt_text,
          }

        // <MrkDwn> component
        if (props.type === mrkdwnSymbol)
          return mrkdwn(html(props.children), props.verbatim)
      }

      return undefined
    })()

    if (current.length > 0 && (independentElement || child === endSymbol)) {
      // Text content
      elements.push(mrkdwn(html(current), true))
      current = []
    }

    if (independentElement) {
      elements.push(independentElement)
    } else if (typeof child !== 'symbol') {
      current.push(child)
    }
  }

  if (elements.length > 10)
    throw new Error(
      `The number of elements generated by <Context> is ${elements.length}. It's going over the limit. (10)`
    )

  return (
    <ObjectOutput<ContextBlock>
      type="context"
      block_id={id || blockId}
      elements={elements}
    />
  )
}
