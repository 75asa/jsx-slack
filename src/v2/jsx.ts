/* eslint-disable dot-notation, import/export, no-redeclare, @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */
export function JSXSlack(node: JSXSlack.Node): any {
  return node
}

export const createComponent = <P extends {}, O extends object>(
  functionalComponent: (props: JSXSlack.Props<P>) => O | null
): JSXSlack.FC<P> => {
  Object.defineProperty(functionalComponent, '$$jsxslackComponent', {
    value: true,
  })
  return functionalComponent as JSXSlack.FC<P>
}

export namespace JSXSlack {
  interface StringLike {
    toString: () => string
  }

  type ChildElement =
    | Node
    | string
    | StringLike
    | boolean // Remove when calling Children.toArray()
    | null // Remove when calling Children.toArray()
    | undefined // Remove when calling Children.toArray()

  type Child = ChildElement | ChildElement[]
  type Children = Child | Child[]
  type FilteredChild = Extract<ChildElement, object | string>

  export type Props<P = any> = { children?: Children } & P

  export type FC<P extends {} = {}> = (props: Props<P>) => Node | null

  export interface Node<P extends {} = any> {
    $$jsxslack: { type: FC<P> | string; props: Props<P>; children: Child[] }
  }

  export const isValidElement = (
    element: unknown
  ): element is JSXSlack.JSX.Element =>
    typeof element === 'object' && !!element?.hasOwnProperty('$$jsxslack')

  export const createElement = (
    type: FC | string,
    props: Props | null,
    ...children: Child[]
  ): JSX.Element | null => {
    let rendered: Node | null = Object.create(null)

    if (typeof type === 'function') {
      const p = { ...(props || {}) }

      if (children.length === 1) [p.children] = children
      else if (children.length > 1) p.children = children

      rendered = type(p)
    }

    if (rendered && typeof rendered === 'object' && !rendered?.$$jsxslack)
      Object.defineProperty(rendered, '$$jsxslack', {
        value: { type, props, children },
      })

    return rendered
  }

  export const h = createElement

  export const Fragment: FC<{ children: Children }> = ({ children }) =>
    children as Node

  export const Children = {
    count: (children: Children): number => {
      if (children === null || children === undefined) return 0
      return Array.isArray(children) ? children.length : 1
    },

    flat: (children: Children) => {
      const reducer: FilteredChild[] = []

      Children.forEach(children, (child) =>
        Array.isArray(child) &&
        !(isValidElement(child) && child.$$jsxslack.type['$$jsxslackComponent'])
          ? reducer.push(...Children.flat(child))
          : reducer.push(child)
      )

      return reducer
    },

    forEach: (
      children: Children,
      callbackFn: (
        value: FilteredChild,
        index: number,
        array: FilteredChild[]
      ) => void
    ): void => {
      Children.map(children, callbackFn)
    },

    map: <T>(
      children: Children,
      callbackFn: (
        value: FilteredChild,
        index: number,
        array: FilteredChild[]
      ) => T
    ): T[] | null | undefined => {
      if (children === null || children === undefined) return children
      return Children.toArray(children).map<T>(callbackFn)
    },

    only: (children: Children): Child => {
      if (Children.count(children) === 1) return children

      throw new Error(
        'JSXSlack.Children.only expected to receive a single JSXSlack element child.'
      )
    },

    toArray: (children: Children) =>
      (Array.isArray(children) ? children : [children]).filter(
        (c): c is FilteredChild => c != null && c !== false && c !== true
      ),
  }

  export namespace JSX {
    export interface Element extends Node {}
    export interface IntrinsicElements {}
    export interface ElementAttributesProperty {
      props: {}
    }
    export interface ElementChildrenAttribute {
      children: {}
    }
  }
}
