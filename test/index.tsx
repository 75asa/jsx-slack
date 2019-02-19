/** @jsx JSXSlack.h */
import { SectionBlock, DividerBlock, ImageBlock } from '@slack/client'
import JSXSlack, { Block, Context, Divider, Image, Section } from '../src/index'

describe('jsx-slack', () => {
  describe('Block Kit as component', () => {
    describe('<Section>', () => {
      const section: SectionBlock = {
        type: 'section',
        block_id: 'hello',
        text: { type: 'mrkdwn', text: 'Hello!', verbatim: false },
      }

      it('outputs section block', () =>
        expect(
          JSXSlack(
            <Block>
              <Section blockId="hello">Hello!</Section>
            </Block>
          )
        ).toStrictEqual([section]))

      it('allows using HTML-compatible <section> element', () =>
        expect(
          JSXSlack(
            <Block>
              <section id="hello">Hello!</section>
            </Block>
          )
        ).toStrictEqual([section]))
    })

    describe('<Divider>', () => {
      const divider: DividerBlock = {
        type: 'divider',
        block_id: 'divider',
      }

      it('outputs divider block', () =>
        expect(
          JSXSlack(
            <Block>
              <Divider blockId="divider" />
            </Block>
          )
        ).toStrictEqual([divider]))

      it('allows using HTML-compatible <hr> element', () =>
        expect(
          JSXSlack(
            <Block>
              <hr id="divider" />
            </Block>
          )
        ).toStrictEqual([divider]))
    })

    describe('<Image>', () => {
      const image: ImageBlock = {
        type: 'image',
        image_url: 'https://example.com/test.jpg',
        alt_text: 'Test image',
        title: {
          type: 'plain_text',
          text: 'This is a test image!',
          emoji: true,
        },
        block_id: 'image',
      }

      it('outputs image block', () =>
        expect(
          JSXSlack(
            <Block>
              <Image
                src="https://example.com/test.jpg"
                alt="Test image"
                title="This is a test image!"
                blockId="image"
              />
            </Block>
          )
        ).toStrictEqual([image]))

      it('allows using HTML-compatible <img> element', () =>
        expect(
          JSXSlack(
            <Block>
              <img
                src="https://example.com/test.jpg"
                alt="Test image"
                title="This is a test image!"
                id="image"
              />
            </Block>
          )
        ).toStrictEqual([image]))
    })

    describe('<Context>', () => {
      it('outputs context block', () =>
        expect(
          JSXSlack(
            <Block>
              <Context blockId="context">
                Hello! <b>World!</b>
                <img src="https://example.com/test.jpg" alt="image" />
                Image + Text
              </Context>
            </Block>
          )
        ).toStrictEqual([
          expect.objectContaining({
            type: 'context',
            block_id: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: 'Hello! *World!*',
                verbatim: false,
              },
              {
                type: 'image',
                image_url: 'https://example.com/test.jpg',
                alt_text: 'image',
              },
              {
                type: 'mrkdwn',
                text: 'Image + Text',
                verbatim: false,
              },
            ],
          }),
        ]))

      it('throws error when the number of elements is 11', () =>
        expect(() =>
          JSXSlack(
            <Block>
              <Context>
                <img src="foo" alt="1" />
                <img src="foo" alt="2" />
                <img src="foo" alt="3" />
                <img src="foo" alt="4" />
                <img src="foo" alt="5" />
                <img src="foo" alt="6" />
                <img src="foo" alt="7" />
                <img src="foo" alt="8" />
                <img src="foo" alt="9" />
                <img src="foo" alt="10" />
                <img src="foo" alt="11" />
              </Context>
            </Block>
          )
        ).toThrow())
    })
  })
})
