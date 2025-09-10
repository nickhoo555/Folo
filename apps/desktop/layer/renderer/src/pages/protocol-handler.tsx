import { useEffect } from "react"
import { Navigate, useSearchParams } from "react-router"

import { useProtocolHandler } from "~/hooks/biz/useProtocolHandler"

export const Component = () => {
  const [searchParams] = useSearchParams()
  const { handleProtocolUrl } = useProtocolHandler()

  useEffect(() => {
    const protocolUrl = searchParams.get("url")
    if (protocolUrl) {
      handleProtocolUrl(protocolUrl)
    }
  }, [searchParams, handleProtocolUrl])

  // Redirect to home after handling the protocol URL
  return <Navigate to="/" replace />
}
