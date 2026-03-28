export type FuelStatus = 'available' | 'nofuel' | 'unknown';
export type QueueLength = 'short' | 'medium' | 'long' | null;

export interface Station {
  id: number;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  fuel_status: FuelStatus;
  queue_length: QueueLength;
  last_updated: string;
  created_at: string;
  reports_count?: number; // Added from README indicating it's appended by count
}

export interface Report {
  id: number;
  station_id: number;
  fuel_status: Exclude<FuelStatus, 'unknown'>;
  queue_length: QueueLength;
  comment: string | null;
  created_at: string;
}

export interface ReportCounts {
  [stationId: number]: number;
}
