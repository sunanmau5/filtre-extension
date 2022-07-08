import React from 'react'
import { Flex, Text } from 'rebass'

export const PopupNoEntries: React.FC = () => {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      sx={{
        px: 3,
        py: 4
      }}>
      <Text>You currently have no entries available for this website.</Text>
    </Flex>
  )
}
