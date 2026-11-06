// Deklarasi tipe lokal minimal untuk `sanitize-html` 2.18.1 (hanya API yang dipakai penyanitasi).
// `@types/sanitize-html` sengaja tidak dipasang (tanpa dependensi tambahan).
declare module 'sanitize-html' {
  export interface Frame {
    tag: string
    attribs: Record<string, string>
    text: string
    tagPosition: number
  }

  export interface Transformed {
    tagName: string
    attribs: Record<string, string>
  }

  export type Transformer = (tagName: string, attribs: Record<string, string>) => Transformed

  export interface IOptions {
    allowedTags?: string[]
    allowedAttributes?: Record<string, string[]>
    allowedSchemes?: string[]
    allowedSchemesByTag?: Record<string, string[]>
    allowedIframeHostnames?: string[]
    allowIframeRelativeUrls?: boolean
    allowProtocolRelative?: boolean
    disallowedTagsMode?: 'discard' | 'completelyDiscard' | 'escape' | 'recursiveEscape'
    nonTextTags?: string[]
    nestingLimit?: number
    parseStyleAttributes?: boolean
    transformTags?: Record<string, Transformer>
    exclusiveFilter?: (frame: Frame) => boolean
    textFilter?: (text: string, tagName: string) => string
  }

  export default function sanitizeHtml(dirty: string, options?: IOptions): string
}
