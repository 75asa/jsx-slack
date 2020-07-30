import { Block, PlainTextElement } from '@slack/types'
import { JSXSlack, createComponent } from '../../jsx'
import { plainText } from '../composition/utils'
import { LayoutBlockProps } from './utils'

export interface HeaderProps extends LayoutBlockProps {
  children: JSXSlack.ChildElements
}

/**
 * {@link https://api.slack.com/reference/messaging/blocks#header|The `header` layout block}
 * to display plain text with bold font in a larger.
 *
 * ```jsx
 * <Blocks>
 *   <Header>
 *     Heads up!
 *   </Header>
 * </Blocks>
 * ```
 *
 * `<Header>` allows only a plain text. You cannot format text through HTML-like
 * tags.
 *
 * @return The partial JSON for `header` layout block
 */
export const Header = createComponent<
  HeaderProps,
  Block & { type: 'header'; text: PlainTextElement }
>('Header', ({ blockId, children, id }) => ({
  type: 'header',
  block_id: blockId || id,
  text: plainText(children),
}))
