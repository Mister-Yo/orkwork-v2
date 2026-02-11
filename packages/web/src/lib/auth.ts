"use client"

import useSWR from 'swr'
import { api } from './api'

export function useUser() {
  const { data: user, error, mutate, isLoading } = useSWR(
    '/auth/me',
    () => api.auth.me(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      errorRetryCount: 1,
    }
  )

  const logout = async () => {
    try {
      await api.auth.logout()
      mutate(null, false) // Clear the user data
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails on server, clear client state
      window.location.href = '/login'
    }
  }

  return {
    user,
    isLoading,
    isLoggedIn: !!user && !error,
    error,
    logout,
    mutate,
  }
}