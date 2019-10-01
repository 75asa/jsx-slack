/** @jsx JSXSlack.h */
import { JSXSlack, jsxOnParsed } from '../jsx'
import { ArrayOutput, isNode, wrap } from '../utils'
import { Divider, Image, Input, Section, Select, Textarea } from './index'

export interface BlocksProps {
  children: JSXSlack.Children<BlockComponentProps>
}

export interface BlockComponentProps {
  blockId?: string
  id?: string
}

export enum InternalBlockType {
  modal = 'modal',
}

export const blockTypeSymbol = Symbol('jsx-slack-block-type')

const knownBlocks = [
  'actions',
  'context',
  'divider',
  'file',
  'image',
  'input',
  'section',
]

export const Blocks: JSXSlack.FC<BlocksProps> = props => {
  const internalType: InternalBlockType | undefined = props[blockTypeSymbol]

  const normalized = wrap(props.children).map(child => {
    if (child && isNode(child) && typeof child.type === 'string') {
      // Aliasing intrinsic elements to Block component
      switch (child.type) {
        case 'hr':
          return <Divider {...child.props}>{...child.children}</Divider>
        case 'img':
          return <Image {...child.props}>{...child.children}</Image>
        case 'input':
          return <Input {...child.props} children={child.children[0]} />
        case 'section':
          return <Section {...child.props}>{...child.children}</Section>
        case 'select':
          return <Select {...child.props}>{...child.children}</Select>
        case 'textarea':
          return <Textarea {...child.props} />
        default:
          throw new Error(
            '<Blocks> allows only including layout block components.'
          )
      }
    }
    return child
  })

  const node = <ArrayOutput>{normalized}</ArrayOutput>

  node.props[jsxOnParsed] = parsed => {
    // Check the final output
    if (parsed.some(b => !knownBlocks.includes(b.type)))
      throw new Error('<Blocks> allows only including layout block components.')

    if (internalType === undefined && parsed.some(b => b.type === 'input'))
      throw new Error(
        '<Input> block cannot place in <Blocks> container for messaging.'
      )
  }

  return node
}

export const BlocksInternal: JSXSlack.FC<
  BlocksProps & { [blockTypeSymbol]?: InternalBlockType }
> = props => Blocks(props)
