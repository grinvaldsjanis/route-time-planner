export interface TrackPointRef {
    trackIndex: number;
    segmentIndex: number;
    pointIndex: number;
  }
  
  export interface GPXData {
    gpxName: string | null;
    waypoints: Waypoint[];
    tracks: Track[];
    trackParts: TrackPart[];
  }
  
  export interface TrackPart {
    waypoints: number[];
    trackPoints: {
      trackIndex: number;
      segmentIndex: number;
      startIndex: number;
      endIndex: number;
    }[];
    distance: number;
    travelTime: number;
    durationMultiplier: number;
  }
  
  export interface Waypoint {
    type: string | null;
    lat: string;
    lon: string;
    name: string | null;
    desc: string | null;
    sym: string | null;
    closestTrackpoint?: TrackPointRef;
    stopTime?: number;
    relativeTimes?: { arrivalSeconds: number; departureSeconds: number };
  }
  
  export interface TrackPoint {
    lat: string;
    lon: string;
    ele: number | null;
    time: string | null;
    curve: number | null;
    slope: number | null;
  }
  
  export interface TrackSegment {
    points: TrackPoint[];
  }
  
  export interface Track {
    name: string | null;
    segments: TrackSegment[];
  }
  