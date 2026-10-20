/**
 * Geospatial utility functions.
 *
 * All functions are pure (no I/O) so they can be used in both
 * server actions and unit tests without any mocking.
 */

const EARTH_RADIUS_METERS = 6_371_000;

/**
 * Computes the great-circle distance between two WGS-84 coordinates
 * using the Haversine formula.
 *
 * @returns Distance in **metres**.
 */
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

/**
 * Returns `true` if two coordinates are within `radiusMeters` of each other.
 */
export function isWithinRadius(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  radiusMeters: number
): boolean {
  return haversineDistanceMeters(lat1, lng1, lat2, lng2) <= radiusMeters;
}

export type GeoCandidate = {
  id: string;
  lat: number;
  lng: number;
};

/**
 * Returns the nearest candidate inside `radiusMeters`, or `null` if none.
 */
export function findClosestWithinRadius<T extends GeoCandidate>(
  originLat: number,
  originLng: number,
  candidates: T[],
  radiusMeters: number
): { candidate: T; distanceMeters: number } | null {
  let closest: T | null = null;
  let closestDist = Infinity;

  for (const candidate of candidates) {
    const dist = haversineDistanceMeters(
      originLat,
      originLng,
      candidate.lat,
      candidate.lng
    );
    if (dist <= radiusMeters && dist < closestDist) {
      closestDist = dist;
      closest = candidate;
    }
  }

  if (!closest) return null;
  return { candidate: closest, distanceMeters: closestDist };
}

export type SeverityCandidate = GeoCandidate & { severity: number };

export type DuplicateGeoMatch<T extends SeverityCandidate> = {
  candidate: T;
  distanceMeters: number;
  /** True when the nearby ticket also shares the incoming severity. */
  severityMatched: boolean;
};

/**
 * Duplicate ranking: distance is required, severity is a confirmer.
 *  1. Ignore anything outside `radiusMeters`.
 *  2. If any nearby ticket shares `severity`, pick the closest of those
 *     (high-confidence duplicate).
 *  3. Otherwise pick the closest nearby ticket of the same category set
 *     (still a duplicate — AI severity can drift).
 */
export function findDuplicateMatch<T extends SeverityCandidate>(
  originLat: number,
  originLng: number,
  candidates: T[],
  radiusMeters: number,
  severity?: number
): DuplicateGeoMatch<T> | null {
  const nearby: { candidate: T; distanceMeters: number }[] = [];

  for (const candidate of candidates) {
    const distanceMeters = haversineDistanceMeters(
      originLat,
      originLng,
      candidate.lat,
      candidate.lng
    );
    if (distanceMeters <= radiusMeters) {
      nearby.push({ candidate, distanceMeters });
    }
  }

  if (nearby.length === 0) return null;

  const severityIsKnown =
    typeof severity === "number" && Number.isFinite(severity);
  const severityHits = severityIsKnown
    ? nearby.filter((item) => item.candidate.severity === severity)
    : [];
  const pool = severityHits.length > 0 ? severityHits : nearby;
  const best = pool.reduce((winner, item) =>
    item.distanceMeters < winner.distanceMeters ? item : winner
  );

  return {
    candidate: best.candidate,
    distanceMeters: best.distanceMeters,
    severityMatched: severityIsKnown && best.candidate.severity === severity,
  };
}
