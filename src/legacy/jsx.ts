import formatDate from '../date'
import { ParseContext } from '../jsx'
import { buildAttr, escapeChars, escapeReplacers } from '../html'
import { detectSpecialLink } from '../utils'

const legacyJsxToHtml = (
  name: string,
  props: Record<string, any>,
  children: any[],
  context: ParseContext
) => {
  const parents = context.elements.slice(0, -1)

  const text = () => children.join('')

  const isChild = (...elements: string[]) =>
    parents.length > 0 &&
    elements.some((e) => e === parents[parents.length - 1])

  const isDescendant = (...elements: string[]) =>
    elements.some((e) => parents.includes(e))

  if (name === 'br') return '<br />'
  if (isChild('pre', 'code') && !['a', 'time'].includes(name)) return text()

  switch (name) {
    case 'b':
    case 'strong':
      if (isDescendant('b', 'strong', 'time')) return text()
      return `<b>${escapeReplacers.bold(text())}</b>`
    case 'i':
    case 'em':
      if (isDescendant('i', 'em', 'time')) return text()

      // Underscores have to avoid escaping in emoji shorthand
      return `<i>${escapeChars(text(), escapeReplacers.italic)}</i>`
    case 's':
    case 'strike':
    case 'del':
      if (isDescendant('s', 'strike', 'del', 'time')) return text()
      return `<s>${escapeReplacers.strikethrough(text())}</s>`
    case 'code':
      if (isDescendant('time')) return text()
      return `<code>${escapeReplacers.code(text())}</code>`
    case 'p':
      return isDescendant('p') ? text() : `<p>${text()}</p>`
    case 'blockquote': {
      if (isDescendant('blockquote', 'ul', 'ol', 'time')) return text()

      const tag = isDescendant('a') ? 'q' : 'blockquote'
      return `<${tag}>${escapeReplacers.blockquote(text())}</${tag}>`
    }
    case 'pre':
      if (isDescendant('ul', 'ol', 'time')) return text()
      return `<pre><code>${escapeReplacers.code(text())}</code></pre>`
    case 'a': {
      if (isDescendant('a', 'time')) return text()

      let content = text()

      // Prevent vanishing special link used as void element
      if (!content && props.href && detectSpecialLink(props.href) !== undefined)
        content = 'specialLink'

      return `<a${buildAttr(props)}>${content}</a>`
    }
    case 'time': {
      const dateInt = Number.parseInt(props.datetime, 10)
      const date = new Date(
        Number.isNaN(dateInt) ? props.datetime : dateInt * 1000
      )
      const datetime = Math.floor(date.getTime() / 1000)
      const format = text().replace(/\|/g, '\u01c0')

      const datetimeAttr = buildAttr({ datetime })
      const fallbackAttr = props.fallback
        ? buildAttr({
            'data-fallback': props.fallback.replace(/\|/g, '\u01c0'),
          })
        : buildAttr({ 'data-fallback': formatDate(date, format) }, false)

      return `<time${datetimeAttr}${fallbackAttr}>${format}</time>`
    }
    case 'small':
    case 'span':
    case 'ul':
    case 'li':
      return `<${name}>${text()}</${name}>`
    case 'ol':
      return `<ol${buildAttr(props)}>${text()}</ol>`
    default:
      throw new Error(`Unknown HTML-like element: ${name}`)
  }
}

export default legacyJsxToHtml
