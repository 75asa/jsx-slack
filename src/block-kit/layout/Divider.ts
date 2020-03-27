import { DividerBlock } from '@slack/types'
import { LayoutBlockProps } from './utils'
import { createComponent } from '../../jsx'

export interface DividerProps extends LayoutBlockProps {
  children?: undefined
}

export const Divider = createComponent<DividerProps, DividerBlock>(
  'Divider',
  ({ blockId, id }) => ({ type: 'divider', block_id: blockId || id })
)
