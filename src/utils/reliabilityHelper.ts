/**
 * Returns a reliability label and color based on report count.
 * The more crowd reports a station has, the more trustworthy its data is.
 */
export function getReliability(reportCount: number = 0) {
  if (reportCount >= 15) {
    return { label: 'High reliability', level: 'high', color: 'text-fuel-green', bars: 3 }
  }
  if (reportCount >= 7) {
    return { label: 'Medium reliability', level: 'medium', color: 'text-fuel-yellow', bars: 2 }
  }
  return { label: 'Low reliability', level: 'low', color: 'text-fuel-red', bars: 1 }
}
