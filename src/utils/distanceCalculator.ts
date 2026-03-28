/**
 * Haversine formula — returns distance in km between two lat/lng points.
 */
import { Station } from '@/types';

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

/**
 * Sort an array of stations by distance from a given lat/lng.
 * Stations must have `latitude` and `longitude` fields.
 */
export function sortByDistance(stations: Station[], userLat: number, userLng: number) {
  return [...stations].sort((a, b) => {
    const distA = haversineDistance(userLat, userLng, a.latitude, a.longitude)
    const distB = haversineDistance(userLat, userLng, b.latitude, b.longitude)
    return distA - distB
  })
}

/**
 * Format distance for display.
 */
export function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)}m away`
  return `${km.toFixed(1)}km away`
}

/**
 * Get the user's current location via browser geolocation API.
 * Returns a Promise that resolves to { lat, lng }.
 */
export function getUserLocation(): Promise<{lat: number, lng: number}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by this browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 10000 }
    )
  })
}
