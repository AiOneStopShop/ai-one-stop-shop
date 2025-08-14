'use client'

import { useState } from 'react'

interface SubscriberData {
  email: string
  first_name?: string
  last_name?: string
  company?: string
  job_title?: string
  industry?: string
  interests?: string[]
  persona?: string
  budget_range?: string
  use_case?: string[]
  source?: string
}

interface SubscriberResponse {
  success: boolean
  data?: any
  isNewSubscriber?: boolean
  message?: string
  error?: string
}

export function useSubscriberManagement() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const subscribe = async (subscriberData: SubscriberData): Promise<SubscriberResponse> => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Get UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search)
      const utmData = {
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_term: urlParams.get('utm_term'),
        utm_content: urlParams.get('utm_content')
      }

      // Get visitor data from localStorage
      const sessionId = localStorage.getItem('ai_shop_session_id')
      
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...subscriberData,
          ...utmData,
          source: 'website',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          language: navigator.language
        }),
      })

      const result: SubscriberResponse = await response.json()

      if (result.success) {
        setSuccess(result.message || 'Successfully subscribed!')
        
        // Track subscription event if visitor tracking is available
        if (window.trackEvent) {
          window.trackEvent({
            event_type: 'subscription',
            event_name: 'Newsletter Subscription',
            element_id: 'newsletter_signup',
            custom_data: {
              email: subscriberData.email,
              persona: subscriberData.persona,
              budget_range: subscriberData.budget_range,
              is_new_subscriber: result.isNewSubscriber
            }
          })
        }
      } else {
        setError(result.error || 'Failed to subscribe')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmail = async (email: string, token: string): Promise<SubscriberResponse> => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/subscribers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          action: 'verify',
          token
        }),
      })

      const result: SubscriberResponse = await response.json()

      if (result.success) {
        setSuccess(result.message || 'Email verified successfully!')
      } else {
        setError(result.error || 'Failed to verify email')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async (email: string, token: string): Promise<SubscriberResponse> => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/subscribers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          action: 'unsubscribe',
          token
        }),
      })

      const result: SubscriberResponse = await response.json()

      if (result.success) {
        setSuccess(result.message || 'Successfully unsubscribed!')
      } else {
        setError(result.error || 'Failed to unsubscribe')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getSubscribers = async (params?: {
    email?: string
    status?: string
    persona?: string
    limit?: number
    offset?: number
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      if (params?.email) searchParams.append('email', params.email)
      if (params?.status) searchParams.append('status', params.status)
      if (params?.persona) searchParams.append('persona', params.persona)
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())

      const response = await fetch(`/api/subscribers?${searchParams.toString()}`)
      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to fetch subscribers')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  return {
    subscribe,
    verifyEmail,
    unsubscribe,
    getSubscribers,
    isLoading,
    error,
    success,
    clearMessages
  }
}

// Helper functions (same as in useVisitorTracking)
function getDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase()
  if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
    return 'mobile'
  } else if (/tablet|ipad/i.test(userAgent)) {
    return 'tablet'
  }
  return 'desktop'
}

function getBrowser(): string {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('chrome')) return 'Chrome'
  if (userAgent.includes('firefox')) return 'Firefox'
  if (userAgent.includes('safari')) return 'Safari'
  if (userAgent.includes('edge')) return 'Edge'
  if (userAgent.includes('opera')) return 'Opera'
  return 'Unknown'
}

function getOS(): string {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('windows')) return 'Windows'
  if (userAgent.includes('mac')) return 'macOS'
  if (userAgent.includes('linux')) return 'Linux'
  if (userAgent.includes('android')) return 'Android'
  if (userAgent.includes('ios')) return 'iOS'
  return 'Unknown'
}

// Extend Window interface for tracking
declare global {
  interface Window {
    trackEvent?: (eventData: any) => void
  }
}
