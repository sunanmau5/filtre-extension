import { BasicCard } from '@components/BasicCard'
import { BasicCardTitle } from '@components/BasicCard/title'
import React, { useEffect, useState } from 'react'
import { Router } from 'react-chrome-extension-router'
import { Box } from 'rebass'
import { UrlType } from '../contexts/url-context'
import { Entries } from '../types/entry-type'
import { getStoredFilters } from '../utils/storage'
import { PopupEntries } from './entries'
import { NavigateAction } from './navigate-action'
import { NoEntries } from './no-entries'

export const PopupWithUrl: React.FC<UrlType> = (props) => {
  const { hostname, pathname } = props
  const [entries, setEntries] = useState<Record<string, Entries> | null>(null)

  const fetchParams = () => {
    getStoredFilters().then((filters) => {
      if (filters[hostname]) {
        setEntries(filters[hostname])
      } else {
        setEntries(null)
      }
    })
  }

  useEffect(fetchParams, [hostname, pathname])

  return (
    <BasicCard>
      <Box
        p={3}
        sx={{
          borderBottom: '1px solid rgb(209, 213, 219)',
          bg: 'white'
        }}>
        <BasicCardTitle>{hostname}</BasicCardTitle>
      </Box>

      {entries ? (
        <Router>
          <PopupEntries entries={entries} />
        </Router>
      ) : (
        <NoEntries text="You currently have no entries available for this website." />
      )}

      <NavigateAction />
    </BasicCard>
  )
}
