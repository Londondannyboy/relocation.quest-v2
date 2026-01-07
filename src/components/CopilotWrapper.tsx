'use client'

import { CopilotKit } from "@copilotkit/react-core"

interface CopilotWrapperProps {
  children: React.ReactNode
}

export function CopilotWrapper({ children }: CopilotWrapperProps) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="atlas_agent">
      {children}
    </CopilotKit>
  )
}
