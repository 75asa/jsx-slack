/** @jsx JSXSlack.h */
import {
  ChannelsSelect as SlackChannelsSelect,
  MultiChannelsSelect,
  InputBlock,
} from '@slack/types'
import {
  ActionProps,
  SingleSelectableProps,
  MultiSelectablePropsFrom,
  ResponsableUrlProps,
} from './utils'
import { ConfirmableProps } from '../composition/Confirm'
import { plainText } from '../composition/utils'
import { InputComponentProps, wrapInInput } from '../layout/Input'
import { BuiltInComponent, createComponent } from '../../jsx'
import { DistributedProps, coerceToInteger } from '../../utils'

interface SingleChannelsSelectProps
  extends ActionProps,
    ConfirmableProps,
    SingleSelectableProps {
  children?: never
  initialChannel?: string
  placeholder?: string
}

interface MultiChannelsSelectProps
  extends MultiSelectablePropsFrom<
    SingleChannelsSelectProps,
    'initialChannel'
  > {
  initialChannel?: string | string[]
}

type ChannelsSelectElement = SlackChannelsSelect & {
  response_url_enabled?: boolean
}

export type ChannelsSelectProps = DistributedProps<
  | InputComponentProps<SingleChannelsSelectProps, ResponsableUrlProps>
  | InputComponentProps<MultiChannelsSelectProps>
>

export const ChannelsSelect: BuiltInComponent<ChannelsSelectProps> = createComponent<
  ChannelsSelectProps,
  ChannelsSelectElement | MultiChannelsSelect | InputBlock
>('ChannelsSelect', (props) => {
  const action_id = props.actionId || props.name
  const placeholder =
    props.placeholder !== undefined ? plainText(props.placeholder) : undefined

  return wrapInInput<ChannelsSelectElement | MultiChannelsSelect>(
    props.multiple
      ? {
          type: 'multi_channels_select',
          action_id,
          placeholder,
          initial_channels:
            props.initialChannel !== undefined
              ? ([] as string[]).concat(props.initialChannel)
              : undefined,
          max_selected_items: coerceToInteger(props.maxSelectedItems),
          confirm: props.confirm as any,
        }
      : {
          type: 'channels_select',
          action_id: props.actionId || props.name,
          placeholder,
          initial_channel: props.initialChannel,
          response_url_enabled:
            props.responseUrlEnabled !== undefined
              ? !!props.responseUrlEnabled
              : undefined,
          confirm: props.confirm as any,
        },
    props,
    ChannelsSelect
  )
})
