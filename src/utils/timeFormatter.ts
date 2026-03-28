import { formatDistanceToNow } from 'date-fns'

/**
 * Returns a human-readable "time ago" string.
 * e.g. "3 minutes ago", "about 1 hour ago"
 */
export function timeAgo(dateString: string | null | undefined) {
  if (!dateString) return 'Never updated'
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

/**
 * Returns a freshness label based on age in minutes.
 * Helps users judge if the data is still reliable.
 */
export function freshnessLabel(dateString: string | null | undefined) {
  if (!dateString) return { label: 'No data', color: 'text-fuel-muted' }

  const ageMinutes = (Date.now() - new Date(dateString).getTime()) / 1000 / 60

  if (ageMinutes < 15) return { label: 'Very fresh', color: 'text-fuel-green' }
  if (ageMinutes < 60) return { label: 'Fairly fresh', color: 'text-fuel-yellow' }
  if (ageMinutes < 180) return { label: 'Getting stale', color: 'text-fuel-yellow' }
  return { label: 'Stale data', color: 'text-fuel-red' }
}
