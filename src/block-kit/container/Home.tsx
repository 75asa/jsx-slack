/** @jsx JSXSlack.h */
import { View } from '@slack/types'
import {
  generateActionsValidator,
  generateBlocksContainer,
  generateSectionValidator,
} from './utils'
import { Divider } from '../layout/Divider'
import { Image } from '../layout/Image'
import { Section } from '../layout/Section'
import { JSXSlack, cleanMeta, createComponent } from '../../jsx'

interface HomeProps {
  children: JSXSlack.ChildNodes

  /**
   * An identifier for this modal to recognize it in various events from Slack.
   */
  callbackId?: string

  /** A unique ID for all views on a per-team basis. */
  externalId?: string

  /**
   * An optional metadata string for handling stored data in callback events
   * from Slack API. (3000 characters maximum)
   */
  privateMetadata?: string
}

const HomeBlocks = generateBlocksContainer({
  name: 'Home',
  availableBlockTypes: {
    actions: generateActionsValidator(),
    context: true,
    divider: true,
    image: true,
    section: generateSectionValidator(),
  },
  aliases: { hr: Divider, img: Image, section: Section },
})

/**
 * The container component for the view of
 * {@link https://api.slack.com/surfaces/tabs|home tabs}.
 *
 * `<Home>` can include following block elements:
 *
 * - `<Section>` (`<section>`)
 * - `<Image>` (`<img>`)
 * - `<Divider>` (`<hr>`)
 * - `<Context>`
 * - `<Actions>`
 *
 * @example
 * ```jsx
 * api.views.publish({
 *   user_id: 'UXXXXXXXX',
 *   view: (
 *     <Home>
 *       <Section>Welcome to my home!</Section>
 *     </Home>
 *   ),
 * })
 * ```
 *
 * **NOTE**: TypeScript requires to cast JSX into suited type / `any`, or wrap
 * with `JSXSlack(<Home>...</Home>)`.
 *
 * @return The object of `view` payload, for `view` field in
 *   {@link https://api.slack.com/methods/views.publish|views.publish} API.
 */
export const Home = createComponent<HomeProps, View>('Home', (props) => ({
  type: 'home',
  callback_id: props.callbackId,
  external_id: props.externalId,
  private_metadata: props.privateMetadata,
  blocks: cleanMeta(<HomeBlocks children={props.children} />) as any[],
}))
