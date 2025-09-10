import { describe, expect, it } from "vitest"

import { parseHtml } from "./html"

describe("parseHtml", () => {
  it("should preserve magnet links", () => {
    const { hastTree } = parseHtml('<a href="magnet:?xt=urn:btih:123">magnet</a>')
    const root: any = hastTree
    const anchor = root.children[0]
    expect(anchor.tagName).toBe("a")
    expect(anchor.properties.href).toBe("magnet:?xt=urn:btih:123")
  })
})
