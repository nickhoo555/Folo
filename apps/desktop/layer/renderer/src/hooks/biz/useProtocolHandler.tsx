import { useCallback, useEffect } from "react"
import { useNavigate } from "react-router"
import { useEventCallback } from "usehooks-ts"

import { useFollow } from "./useFollow"

interface ProtocolParams {
  id?: string
  type?: "url" | "feed" | "list"
  url?: string
  view?: string
}

export const useProtocolHandler = () => {
  const follow = useFollow()
  const navigate = useNavigate()

  const handleProtocolUrl = useEventCallback((url: string) => {
    const params = extractParamsFromProtocolUrl(url)
    if (!params) return

    switch (params.action) {
      case "add": {
        const { id, type, url: feedUrl } = params
        if (!id && !feedUrl) return

        follow({
          isList: type === "list",
          id,
          url: feedUrl,
        })
        break
      }
      case "list": {
        const { id, view } = params
        if (!id) return
        navigate(`/lists/${id}${view ? `?view=${view}` : ""}`)
        break
      }
      case "feed": {
        const { id, view } = params
        if (!id) return
        navigate(`/feeds/${id}${view ? `?view=${view}` : ""}`)
        break
      }
      case "discover": {
        const { route } = params
        if (!route) return
        navigate(`/discover/rsshub/${encodeURIComponent(route)}`)
        break
      }
      case "refresh": {
        window.location.reload()
        break
      }
    }
  })

  const registerProtocolHandler = useCallback(() => {
    if (!("registerProtocolHandler" in navigator)) {
      console.warn("Protocol handler registration is not supported in this browser")
      return
    }

    try {
      // Register follow:// protocol
      navigator.registerProtocolHandler(
        "web+follow",
        `${window.location.origin}/protocol-handler?url=%s`,
        "Follow RSS Reader",
      )

      // Also register folo:// protocol for compatibility
      navigator.registerProtocolHandler(
        "web+folo",
        `${window.location.origin}/protocol-handler?url=%s`,
        "Follow RSS Reader",
      )
    } catch (error) {
      console.warn("Failed to register protocol handler:", error)
    }
  }, [])

  const checkForProtocolUrl = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const protocolUrl = urlParams.get("url")

    if (protocolUrl) {
      // Clean up the URL
      const newUrl = new URL(window.location)
      newUrl.search = ""
      window.history.replaceState({}, "", newUrl.toString())

      // Handle the protocol URL
      handleProtocolUrl(protocolUrl)
    }
  }, [handleProtocolUrl])

  useEffect(() => {
    // Check for protocol URL on mount
    checkForProtocolUrl()
  }, [checkForProtocolUrl])

  return {
    registerProtocolHandler,
    handleProtocolUrl,
  }
}

// Extract parameters from protocol URLs
// follow://add?id=123&type=list&url=https://example.com
// follow://list?id=123&view=1
// follow://feed?id=123&view=1
// follow://discover?route=rsshub/routes/en
// follow://refresh
const extractParamsFromProtocolUrl = (
  url: string,
): ({ action: string } & ProtocolParams & { route?: string }) | null => {
  try {
    const parsedUrl = new URL(url)
    const protocol = parsedUrl.protocol.replace(":", "")

    // Support both follow:// and folo:// protocols
    if (!["follow", "folo", "web+follow", "web+folo"].includes(protocol)) {
      return null
    }

    const action = parsedUrl.hostname || parsedUrl.pathname.replace("/", "")
    const { searchParams } = parsedUrl

    return {
      action,
      id: searchParams.get("id") || undefined,
      type: (searchParams.get("type") as "url" | "feed" | "list") || undefined,
      url: searchParams.get("url") || undefined,
      view: searchParams.get("view") || undefined,
      route: searchParams.get("route") || undefined,
    }
  } catch {
    return null
  }
}
