'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface VisitorData {
  session_id: string
  ip_address?: string
  user_agent?: string
  referrer?: string
  landing_page?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  country?: string
  city?: string
  region?: string
  timezone?: string
  device_type?: string
  browser?: string
  os?: string
  screen_resolution?: string
  language?: string
}

interface EventData {
  session_id: string
  visitor_id?: number
  event_type: string
  event_name: string
  page_url?: string
  page_title?: string
  element_id?: string
  element_class?: string
  element_text?: string
  custom_data?: any
}

export function useVisitorTracking() {
  const [sessionId, setSessionId] = useState<string>('')
  const [visitorId, setVisitorId] = useState<number | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const router = useRouter()

  // Generate or retrieve session ID
  useEffect(() => {
    const storedSessionId = localStorage.getItem('ai_shop_session_id')
    if (storedSessionId) {
      setSessionId(storedSessionId)
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('ai_shop_session_id', newSessionId)
      setSessionId(newSessionId)
    }
  }, [])

  // Track page views
  useEffect(() => {
    if (!sessionId || isTracking) return

    const trackPageView = async () => {
      try {
        setIsTracking(true)
        
        // Get visitor data
        const visitorData: VisitorData = {
          session_id: sessionId,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          landing_page: window.location.pathname,
          utm_source: new URLSearchParams(window.location.search).get('utm_source') || undefined,
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
          utm_term: new URLSearchParams(window.location.search).get('utm_term') || undefined,
          utm_content: new URLSearchParams(window.location.search).get('utm_content') || undefined,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          screen_resolution: `${screen.width}x${screen.height}`,
          language: navigator.language
        }

        // Track visitor
        const visitorResponse = await fetch('/api/visitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(visitorData),
        })

        const visitorResult = await visitorResponse.json()
        
        if (visitorResult.success && visitorResult.data) {
          setVisitorId(visitorResult.data.id)
          
          // Track page view event
          const eventData: EventData = {
            session_id: sessionId,
            visitor_id: visitorResult.data.id,
            event_type: 'page_view',
            event_name: 'Page View',
            page_url: window.location.href,
            page_title: document.title
          }

          await fetch('/api/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
          })
        }
      } catch (error) {
        console.error('Error tracking visitor:', error)
      } finally {
        setIsTracking(false)
      }
    }

    trackPageView()
  }, [sessionId, isTracking])

  // Track custom events
  const trackEvent = async (eventData: Omit<EventData, 'session_id' | 'visitor_id'>) => {
    if (!sessionId) return

    try {
      const fullEventData: EventData = {
        ...eventData,
        session_id: sessionId,
        visitor_id: visitorId || undefined
      }

      await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullEventData),
      })
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  // Track clicks
  const trackClick = (elementId: string, elementText?: string, customData?: any) => {
    trackEvent({
      event_type: 'click',
      event_name: 'Element Click',
      element_id: elementId,
      element_text: elementText,
      custom_data: customData
    })
  }

  // Track form submissions
  const trackFormSubmission = (formName: string, customData?: any) => {
    trackEvent({
      event_type: 'form_submit',
      event_name: 'Form Submission',
      element_id: formName,
      custom_data: customData
    })
  }

  // Track tool interactions
  const trackToolInteraction = (toolName: string, action: string, customData?: any) => {
    trackEvent({
      event_type: 'tool_interaction',
      event_name: `Tool ${action}`,
      element_id: toolName,
      custom_data: { ...customData, tool_name: toolName, action }
    })
  }

  return {
    sessionId,
    visitorId,
    isTracking,
    trackEvent,
    trackClick,
    trackFormSubmission,
    trackToolInteraction
  }
}

// Helper functions
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
