/* eslint-disable import/export */
import flattenDeep from 'lodash.flattendeep'
import { parse } from './html'

const wrapArray = <T>(v: T) => (Array.isArray(v) ? v : [v])

export function JSXSlack(elm: JSXSlack.Node<any>) {
  const processedChildren = (): any[] => {
    if (elm.children == null || typeof elm.children === 'boolean') return []

    return (Array.isArray(elm.children) ? elm.children : [elm.children])
      .map(e => (typeof e === 'string' ? e : JSXSlack(e)))
      .filter(e => e)
  }

  switch (elm.node) {
    case JSXSlack.NodeType.object:
      return elm.props
    case JSXSlack.NodeType.array:
      return processedChildren()
    case JSXSlack.NodeType.string:
      return processedChildren()
        .map(e => e.toString())
        .join('')
    default:
      if (typeof elm.node === 'string')
        return parse(elm.node, elm.props, processedChildren())

      throw new Error(`Unknown node type: ${elm.node}`)
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace JSXSlack {
  export type Child = Node<any> | string | boolean | null | undefined
  export type Children = Child | Child[]

  export enum NodeType {
    object,
    array,
    string,
  }

  export interface Node<P = any> {
    node: FC<P> | string | NodeType
    props: P
    children: (Node<any> | string)[]
  }

  export type FC<P> = (
    props: Readonly<{ children?: unknown } & P>
  ) => Node<any> | null

  export const h = <P = {}>(
    type: FC<P> | string | NodeType,
    props: P | undefined,
    ...rest: Children[]
  ): JSX.Element => {
    const children = flattenDeep(rest).filter(
      c => c != null && typeof c !== 'boolean'
    ) as (Node<any> | string)[]

    if (typeof type === 'function') {
      return (type as any)({
        ...(props || {}),
        children: children.length === 0 ? undefined : children,
      })
    }

    return {
      node: type,
      props: props || {},
      children,
    }
  }

  export const Arr: FC<{ children: Children }> = ({ children }) =>
    h(NodeType.array, {}, ...wrapArray(children))

  export const Obj: FC<{ [key: string]: any }> = props => {
    const collected = {}

    for (const key of Object.keys(props)) {
      if (key !== 'children') collected[key] = props[key]
    }

    return h(NodeType.object, collected)
  }

  export const Str: FC<{ children: Children }> = ({ children }) =>
    h(NodeType.string, {}, ...wrapArray(children))

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Element extends Node<any> {}
    export interface IntrinsicElements {
      a: { href: string }
      b: {}
      blockquote: {}
      br: {}
      code: {}
      del: {}
      em: {}
      i: {}
      li: {}
      p: {}
      pre: {}
      s: {}
      strong: {}
      time: { datetime: string | number; fallback?: string }
      ul: {}
    }
    export interface ElementAttributesProperty {
      props
    }
    export interface ElementChildrenAttribute {
      children
    }
  }
}
