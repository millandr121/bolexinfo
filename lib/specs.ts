export interface Spec {
  label: string;
  value: string;
}

/**
 * Longest a recovered spec value can be and still read as a glanceable fact
 * rather than a sentence.
 *
 * The archived specifications fall into two genuinely different shapes, and the
 * gap between them is wide enough to split on confidently. Measured across all
 * 54 recovered cameras (857 values), average value length by label runs:
 *
 *   Overall Dimensions 18 · Weight 22 · Tripod Socket 27 · Shutter 40
 *   Variable Speed 45 · Zoom Lens 59 · Lens Mount 62
 *   ——— 72 ———
 *   Power Supply 86 · Outer Case 98 · Turret 114 · Viewfinder 172
 *   Threading 197 · Motor 211 · Film Capacity 219
 *
 * Everything below the line is a measurement or a short noun phrase that can
 * sit in a compact grid cell; everything above it is prose that needs a
 * reading measure. The threshold sits in the empty 62–86 band, so it is not
 * balanced on a tie.
 */
export const GLANCE_MAX_LENGTH = 72;

export interface PartitionedSpecs {
  /** Short, scannable facts — dimensions, weight, speeds, mount. */
  glance: Spec[];
  /** Prose specifications that need a reading measure. */
  detail: Spec[];
}

/**
 * Split recovered specifications into the two shapes they actually take.
 *
 * This is a presentation decision only: nothing is dropped, reordered within
 * its group, or rewritten, so both groups together are always exactly the
 * archived spec list. Showing the short facts as a compact grid near the top
 * puts the identifying measurements in front of the reader without scrolling,
 * and leaves the prose specs at a width where they are still readable.
 */
export function partitionSpecs(specs: readonly Spec[]): PartitionedSpecs {
  const glance: Spec[] = [];
  const detail: Spec[] = [];
  for (const spec of specs) {
    (spec.value.length <= GLANCE_MAX_LENGTH ? glance : detail).push(spec);
  }
  return { glance, detail };
}
