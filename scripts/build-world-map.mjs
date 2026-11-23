/**
 * Turn Natural Earth's land outline into one SVG path, written into the
 * repository as lib/world-map.ts.
 *
 * Done at build time and committed so the site carries a world map with
 * no map service behind it: no tile server, no API key, nothing that
 * watches who looked at the page. That matters more here than the few
 * kilobytes it costs. Everything else on this site is served from our
 * own origin, and a map is not worth making the exception for.
 *
 * Natural Earth is public domain; the `world-atlas` package that
 * redistributes it as TopoJSON is ISC. Both are development
 * dependencies only, because this output is checked in.
 *
 * Equirectangular, because the map is read as "which continent, and
 * who is near me" rather than measured. It is the projection whose
 * arithmetic a reader can see through, and plotting a point on it is
 * two divisions, so the dots cannot drift from the coastlines.
 *
 * Run with: node scripts/build-world-map.mjs
 */

import fs from "node:fs";
import { feature } from "topojson-client";
import topology from "world-atlas/land-110m.json" with { type: "json" };

/* The frame. Antarctica is dropped: it runs the full width of the map,
   costs a third of the path data, and no one is having a camera
   serviced there. The north is cut just above Greenland. */
const NORTH = 84;
const SOUTH = -56;
const WIDTH = 1000;
const HEIGHT = Math.round((WIDTH * (NORTH - SOUTH)) / 360);

const project = ([lon, lat]) => [
  ((lon + 180) / 360) * WIDTH,
  ((NORTH - lat) / (NORTH - SOUTH)) * HEIGHT,
];

/* One decimal place is a fifth of a pixel at this size, which is finer
   than the screen can draw and halves the file. */
const round = (n) => Math.round(n * 10) / 10;

/* Two thresholds, both in frame pixels, set by eye against the
   rendered map: points closer together than this are the same point
   once drawn, and a ring enclosing less than this is a speck. */
const MIN_STEP = 3.5;
const MIN_AREA = 2.5;

const area = (points) => {
  let sum = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    sum += points[j][0] * points[i][1] - points[i][0] * points[j][1];
  }
  return Math.abs(sum) / 2;
};

/**
 * A ring to an SVG subpath, thinned.
 *
 * The 110m outline carries more detail than a 1000px-wide map can
 * draw, so points nearer than a pixel and a half to the last one kept
 * are dropped, and rings that enclose almost nothing go entirely. The
 * last point is always kept whatever its spacing, so the ring still
 * closes where it started rather than cutting a corner.
 */
function ring(coordinates) {
  /*
   * Natural Earth cuts its polygons at the antimeridian, so a ring
   * that reaches the dateline runs up one side at +180 and continues
   * at -180. On an equirectangular frame those two points sit at
   * opposite edges, and joining them draws a line straight across the
   * map. Four rings do it here, Afro-Eurasia among them, which is
   * where the stray horizontal lines came from.
   *
   * Splitting the ring wherever longitude jumps more than half the
   * world gives back the pieces the cut made. Each is closed on its
   * own, which seals it along the dateline: a vertical edge at the
   * very edge of the frame, where it cannot be seen.
   */
  const pieces = [[]];
  let previousLon = null;
  for (const position of coordinates) {
    if (previousLon !== null && Math.abs(position[0] - previousLon) > 180) pieces.push([]);
    pieces[pieces.length - 1].push(position);
    previousLon = position[0];
  }

  let d = "";
  for (const piece of pieces) {
    const points = [];
    let last = null;
    piece.forEach((position, i) => {
      const [x, y] = project(position).map(round);
      const far = !last || Math.abs(x - last[0]) + Math.abs(y - last[1]) >= MIN_STEP;
      if (!far && i < piece.length - 1) return;
      if (last && x === last[0] && y === last[1]) return;
      points.push([x, y]);
      last = [x, y];
    });
    if (points.length < 3 || area(points) < MIN_AREA) continue;
    d += `M${points.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
  }
  return d;
}

/* `feature` hands back a FeatureCollection for a GeometryCollection
   and a single Feature otherwise, and either may hold Polygon or
   MultiPolygon, so flatten all four cases to a list of polygons. */
const converted = feature(topology, topology.objects.land);
const geometries = (converted.features ?? [converted]).map((f) => f.geometry);
const polygons = geometries.flatMap((g) =>
  g.type === "MultiPolygon" ? g.coordinates : [g.coordinates],
);

let d = "";
let rings = 0;
for (const polygon of polygons) {
  for (const coordinates of polygon) {
    /* Everything is clipped to the frame, so a ring wholly south of it
       (Antarctica, the South Sandwich Islands) is left out rather than
       drawn flat along the bottom edge. */
    if (coordinates.every(([, lat]) => lat < SOUTH)) continue;
    const subpath = ring(coordinates.map(([lon, lat]) => [lon, Math.max(lat, SOUTH)]));
    if (!subpath) continue;
    d += subpath;
    rings++;
  }
}

const out = `/**
 * The world, as one SVG path.
 *
 * Generated by scripts/build-world-map.mjs from Natural Earth's 110m
 * land outline, which is public domain. Do not edit by hand: run the
 * script again.
 *
 * Equirectangular on a ${WIDTH} by ${HEIGHT} frame covering ${NORTH}°N to
 * ${SOUTH}°S, so a point is placed by \`project\` below and nothing else.
 */

export const WORLD_WIDTH = ${WIDTH};
export const WORLD_HEIGHT = ${HEIGHT};
const NORTH = ${NORTH};
const SOUTH = ${SOUTH};

/** Where a latitude and longitude fall on the frame above. */
export function project(lat: number, lon: number): { x: number; y: number } {
  return {
    x: ((lon + 180) / 360) * WORLD_WIDTH,
    y: ((NORTH - lat) / (NORTH - SOUTH)) * WORLD_HEIGHT,
  };
}

export const WORLD_PATH =
  "${d}";
`;

fs.writeFileSync("lib/world-map.ts", out);
console.log(`lib/world-map.ts — ${rings} rings, ${(d.length / 1024).toFixed(1)} kB of path`);
