import TurndownService from 'turndown'
import { JSXSlack } from './jsx'
import { escapeEntity } from './html'

const applyMarkup = (
  delimiter: string,
  target: string,
  wrapPre: boolean = true
) =>
  target.replace(/^((?:&gt; ?)?)(.*)$/gm, (original, quote, str) => {
    let filtered = str.replace(/<br \/>/g, '')

    if (!wrapPre) filtered = filtered.replace(/<<pre:\d+s?>>/g, '')
    if (!filtered.trim()) return original

    return `${quote}${delimiter}${str}${delimiter}`
  })

const preSymbol = Symbol('pre')

const turndownService = () => {
  const td = new TurndownService({
    br: '<br />',
    bulletListMarker: '•',
    codeBlockStyle: 'fenced',
    codeDelimiter: JSXSlack.exactMode() ? '\u200b`\u200b' : '`',
    emDelimiter: JSXSlack.exactMode() ? '\u200b_\u200b' : '_',
    fence: '```',
    linkStyle: 'mrkdwn',
    strikethroughDelimiter: JSXSlack.exactMode() ? '\u200b~\u200b' : '~',
    strongDelimiter: JSXSlack.exactMode() ? '\u200b*\u200b' : '*',
  })

  const rules = {
    heading: null,
    horizontalRule: null,
    image: null,

    blockquote: {
      filter: 'blockquote',
      replacement: (s: string) =>
        `\n\n${`${s.replace(/^\n+|\n+$/g, '')}\n`.replace(/^/gm, '&gt; ')}\n\n`,
    },
    quote: {
      filter: 'q',
      replacement: (s: string) => `&gt; ${s}`, // For blockquote inside a link
    },
    code: {
      filter: (node: HTMLElement) => {
        const hasSiblings = node.previousSibling || node.nextSibling
        const isCodeBlock =
          node &&
          node.parentNode &&
          node.parentNode.nodeName === 'PRE' &&
          !hasSiblings

        return node.nodeName === 'CODE' && !isCodeBlock
      },
      replacement: (s: string, _, { codeDelimiter }) =>
        applyMarkup(codeDelimiter, s),
    },
    emphasis: {
      filter: ['em', 'i'],
      replacement: (s: string, _, { emDelimiter }) =>
        applyMarkup(emDelimiter, s),
    },
    fencedCodeBlock: {
      filter: (node: HTMLElement, options) =>
        options.codeBlockStyle === 'fenced' &&
        node.nodeName === 'PRE' &&
        node.firstChild &&
        node.firstChild.nodeName === 'CODE',
      replacement: (_, node: HTMLElement, opts) => {
        const pre = node.firstChild ? node.firstChild.textContent : ''
        const singleLine = node.parentNode && node.parentNode.nodeName === 'A'
        opts[preSymbol].push(pre)

        return `\n${`<<pre:${opts[preSymbol].length - 1}${
          singleLine ? 's' : ''
        }>>`}\n`
      },
    },
    listItem: {
      filter: 'li',
      replacement: (s: string, node: HTMLElement, { bulletListMarker }) => {
        const content = s
          .replace(/^\n+/, '') // remove leading newlines
          .replace(/\n+$/, '\n') // replace trailing newlines with just a single one

        let prefix = `${bulletListMarker} `
        let indent = `\u2007 ` // Figure space + space

        const parent = node.parentNode
        if (parent && parent.nodeName === 'OL') {
          const start = (parent as HTMLOListElement).getAttribute('start')
          const index = Array.prototype.indexOf.call(parent.children, node)
          const number = (start ? Number(start) + index : index + 1).toString()

          prefix = `${number}. `
          indent = ''

          for (let i = 0; i < number.length; i += 1) indent += '\u2007'
          indent += '  '
        }

        return `${prefix}${content.replace(/\n/gm, `\n${indent}`)}${
          node.nextSibling && !/\n$/.test(content) ? '\n' : ''
        }`
      },
    },
    mrkdwnLink: {
      filter: (node: HTMLElement, { linkStyle }) =>
        linkStyle === 'mrkdwn' &&
        node.nodeName === 'A' &&
        node.getAttribute('href'),
      replacement: (s: string, node: HTMLElement) => {
        let href = node.getAttribute('href')
        if (!href) return ''

        // Link to channel and user mention
        if (/^(?:#C|@U)[A-Z0-9]{8}$/.test(href)) return `<${href}>`
        if (/^@S[A-Z0-9]{8}$/.test(href)) return `<!subteam^${href.slice(1)}>`

        // Special mention
        const spMention = href.match(/^@(here|channel|everyone)$/)
        if (spMention) return `<!${spMention[1]}|${spMention[1]}>`

        // General URI
        href = encodeURI(href)
        return `<${href}|${s.replace(/(?:(?:<br \/>)?\n)+/g, ' ').trim()}>`
      },
    },
    strong: {
      filter: ['strong', 'b'],
      replacement: (s: string, _, { strongDelimiter }) =>
        applyMarkup(strongDelimiter, s),
    },
    strikethrough: {
      filter: ['del', 's', 'strike'],
      replacement: (s: string, _, { strikethroughDelimiter }) =>
        applyMarkup(strikethroughDelimiter, s, false),
    },
  }

  td.escape = (str: string) => escapeEntity(str)

  Object.defineProperty(td.options, preSymbol, { writable: true, value: [] })

  const { turndown: originalTurndown } = td
  const postprocess = (mrkdwn: string) =>
    mrkdwn
      .replace(/<br \/>/g, '')
      .replace(/<<pre:(\d+)(s?)>>/g, (_, i, singleLine) => {
        if (singleLine) {
          return `\`\`\`${td.options[preSymbol][i].replace(/\n+/g, ' ')}\`\`\``
        }
        return `\`\`\`\n${td.options[preSymbol][i]}\n\`\`\``
      })

  td.turndown = (...args) => {
    td.options[preSymbol] = []
    return postprocess(originalTurndown.apply(td, args))
  }

  for (const rule of Object.keys(rules)) {
    td.remove(rule)
    if (rules[rule]) td.addRule(rule, rules[rule])
  }

  return td
}

export default function turndown(html: string) {
  return turndownService().turndown(html)
}
