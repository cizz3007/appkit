'use client'

import { type ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type Config, WagmiProvider, cookieToInitialState } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()

interface AppProviderProps {
  children: ReactNode
  cookies: string | null
  wagmiConfig: Config
}

function AppProvider({ children, cookies, wagmiConfig }: AppProviderProps) {
  const initialState = cookieToInitialState(wagmiConfig, cookies)

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export { AppProvider }
export type { AppProviderProps }
