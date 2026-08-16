import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackEvent } from '../lib/analytics'

export default function RouteTracker() {
    const { pathname } = useLocation()

    useEffect(() => {
        trackEvent('page_view', pathname)
    }, [pathname])

    return null
}
