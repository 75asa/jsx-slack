/** @jsx JSXSlack.h */
import { SectionBlock } from '@slack/client'
import { JSXSlack } from '../jsx'
import html from '../html'
import { BlockComponentProps } from './Block'

export interface SectionProps extends BlockComponentProps {
  children: JSXSlack.Children
}

export const Section: JSXSlack.FC<SectionProps> = ({
  blockId,
  children,
}): JSXSlack.Node<SectionBlock> => (
  <JSXSlack.Obj
    type="section"
    block_id={blockId}
    text={{
      type: 'mrkdwn',
      text: html(children),
    }}
  />
)
