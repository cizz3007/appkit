import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Code,
  Heading,
  Stack,
  StackDivider
} from '@chakra-ui/react'
import type { Config } from 'wagmi'

import { useAppKitAccount } from '@reown/appkit/react'

import { useWagmiAvailableCapabilities } from '@/src/hooks/useWagmiActiveCapabilities'

import { WagmiDisconnectTest } from './WagmiDisconnectTest'
import { WagmiGetCallsStatusTest } from './WagmiGetCallsStatusTest'
import { WagmiSendCallsCustomAbiWithPaymasterServiceTest } from './WagmiSendCallsCustomAbiWithPaymasterServiceTest'
import { WagmiSendCallsTest } from './WagmiSendCallsTest'
import { WagmiSendCallsWithPaymasterServiceTest } from './WagmiSendCallsWithPaymasterServiceTest'
import { WagmiSendUSDCTest } from './WagmiSendUSDCTest'
import { WagmiSignMessageTest } from './WagmiSignMessageTest'
import { WagmiSignTypedDataTest } from './WagmiSignTypedDataTest'
import { WagmiTransactionTest } from './WagmiTransactionTest'
import { WagmiWriteContractTest } from './WagmiWriteContractTest'

interface IProps {
  config?: Config
}

export function WagmiTests({ config }: IProps) {
  const { address } = useAppKitAccount({ namespace: 'eip155' })
  const { availableCapabilities, fetchCapabilities, hasFetchedCapabilities, capabilitiesToRender } =
    useWagmiAvailableCapabilities()

  if (!address) {
    return null
  }

  return (
    <Card data-testid="eip155-test-interactions" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Wagmi Test Interactions</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Message
            </Heading>
            <WagmiSignMessageTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Typed Data
            </Heading>
            <WagmiSignTypedDataTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Transaction
            </Heading>
            <WagmiTransactionTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Contract Write
            </Heading>
            <WagmiWriteContractTest />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              USDC Send
            </Heading>
            <WagmiSendUSDCTest config={config} />
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              EIP-5792 Capabilities
            </Heading>
            <Button onClick={fetchCapabilities} data-testid="fetch-capabilities-button">
              {hasFetchedCapabilities ? 'Re-fetch' : 'Fetch'} Capabilities
            </Button>
            <br />
            <Code marginTop={2} whiteSpace="pre-wrap">
              {capabilitiesToRender}
            </Code>
          </Box>
          {availableCapabilities && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Send Calls (Atomic Batch)
              </Heading>
              <WagmiSendCallsTest capabilities={availableCapabilities} />
            </Box>
          )}
          {availableCapabilities && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Get Calls Status
              </Heading>
              <WagmiGetCallsStatusTest />
            </Box>
          )}
          {availableCapabilities && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Send Calls (Paymaster Service)
              </Heading>
              <WagmiSendCallsWithPaymasterServiceTest capabilities={availableCapabilities} />
            </Box>
          )}
          {availableCapabilities && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Send Calls with custom abi (Paymaster Service)
              </Heading>
              <WagmiSendCallsCustomAbiWithPaymasterServiceTest
                capabilities={availableCapabilities}
              />
            </Box>
          )}
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Disconnect
            </Heading>
            <WagmiDisconnectTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}
