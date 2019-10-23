/** @jsx JSXSlack.h */
import { JSXSlack } from '../jsx'
import { ArrayOutput, aliasTo, isNode } from '../utils'
import { actionTypes } from './Actions'
import { internalHiddenType, internalSubmitType } from './Input'
import { sectionAccessoryTypes } from './Section'
import { Divider, Image, Input, Section, Select, Textarea } from './index'

type KnownMap = Map<InternalBlockType | undefined, (string | symbol)[]>

export interface BlocksProps {
  children: JSXSlack.Children<BlockComponentProps>
}

export interface BlockComponentProps {
  blockId?: string
  id?: string
}

export enum InternalBlockType {
  Modal = 'modal',
  Home = 'home',
}

export const blockTypeSymbol = Symbol('jsx-slack-block-type')

const knownBlocks: KnownMap = new Map()
const knownActions: KnownMap = new Map()
const knownSectionAccessories: KnownMap = new Map()

const basicBlocks = ['actions', 'context', 'divider', 'image', 'section']

// Blocks
knownBlocks.set(undefined, [...basicBlocks, 'file'])
knownActions.set(undefined, actionTypes.filter(t => t !== 'radio_buttons'))
knownSectionAccessories.set(
  undefined,
  sectionAccessoryTypes.filter(t => t !== 'radio_buttons')
)

// Modal
knownBlocks.set(InternalBlockType.Modal, [
  ...basicBlocks,
  'input',
  internalHiddenType,
  internalSubmitType,
])
knownActions.set(
  InternalBlockType.Modal,
  actionTypes.filter(t => t !== 'radio_buttons')
)
knownSectionAccessories.set(
  InternalBlockType.Modal,
  sectionAccessoryTypes.filter(t => t !== 'radio_buttons')
)

// Home
knownBlocks.set(InternalBlockType.Home, basicBlocks)
knownActions.set(InternalBlockType.Home, [...actionTypes])
knownSectionAccessories.set(InternalBlockType.Home, [...sectionAccessoryTypes])

export const Blocks: JSXSlack.FC<BlocksProps> = props => {
  const internalType: InternalBlockType | undefined = props[blockTypeSymbol]

  const availableBlocks = knownBlocks.get(internalType) || []
  const availableActions = knownActions.get(internalType) || []
  const availableSectionAccessories =
    knownSectionAccessories.get(internalType) || []

  const normalized = JSXSlack.normalizeChildren(props.children).map(child => {
    if (isNode(child) && typeof child.type === 'string') {
      // Aliasing intrinsic elements to Block component
      switch (child.type) {
        case 'hr':
          return aliasTo(Divider, child)
        case 'img':
          return aliasTo(Image, child)
        case 'input':
          return aliasTo(Input, child)
        case 'section':
          return aliasTo(Section, child)
        case 'select':
          return aliasTo(Select, child)
        case 'textarea':
          return aliasTo(Textarea, child)
        default:
          throw new Error(
            '<Blocks> allows only including layout block components.'
          )
      }
    }
    return child
  })

  for (const child of normalized) {
    if (isNode(child) && child.type === JSXSlack.NodeType.object) {
      if (availableBlocks.includes(child.props.type)) {
        // Validate compatibillity of actions and section accessory with container
        switch (child.props.type) {
          case 'actions':
            if (
              child.props.elements.some(e => !availableActions.includes(e.type))
            ) {
              throw new Error(
                '<Actions> block has an incompatible element with container.'
              )
            }
          case 'section':
            if (
              child.props.accessory &&
              !availableSectionAccessories.includes(child.props.accessory.type)
            ) {
              throw new Error(
                '<Section> block has an incompatible element with container.'
              )
            }
        }
        continue
      }
    }

    throw new Error(
      'Block container allows only including valid layout block components.'
    )
  }

  return <ArrayOutput>{normalized}</ArrayOutput>
}

export const BlocksInternal: JSXSlack.FC<
  BlocksProps & { [blockTypeSymbol]?: InternalBlockType }
> = props => Blocks(props)
