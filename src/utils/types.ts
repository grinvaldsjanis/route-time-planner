

export interface GPXData {
  gpxName: string | null;
  referenceWaypoints: ReferenceWaypoint[];
  tracks: Track[];
}

export interface TrackPart {
 startIndex: number;
 endIndex: number;
 distance: number;
 travelTime: number;
 durationMultiplier: number;
}

export interface ReferenceWaypoint {
  id: string;
  lat: string;
  lon: string;
  name: string | null;
  desc: string | null;
  sym: string | null;
  type: string | null;
  imageUrl?: string | null;
}

export interface TrackWaypoint {
  referenceId: string;
  stopTime?: number;
  relativeTimes?: { arrivalSeconds: number; departureSeconds: number };
  closestTrackPointIndex?: number;
  distanceFromStart?: number;
  distanceToEnd?: number;
}

export interface TrackPoint {
  lat: string;
  lon: string;
  ele: number | null;
  curve: number | null;
  slope: number | null;
}

export interface Track {
  name: string | null;
  points: TrackPoint[];
  waypoints: TrackWaypoint[];
  parts: TrackPart[];
}
