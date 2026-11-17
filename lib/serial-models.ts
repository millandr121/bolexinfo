import { getCameraRecords, getProjectorRecords } from "./museum";
import { deriveTells, type SerialModel } from "./serials";

/**
 * Every model whose archived page published its own serial table.
 *
 * Only cameras and projectors were ever serial-catalogued: the recovered lens
 * and accessory pages carry no range tables at all, so those kinds are
 * genuinely absent from the lookup rather than merely unimplemented. That is
 * also why the lookup's filter offers two kinds and not three.
 *
 * Lives here rather than beside the serials page because the front page now
 * leads with the same lookup, and two copies of this would eventually
 * disagree.
 */
export function serialModels(): SerialModel[] {
  const cameras = getCameraRecords().map((m) => ({ m, kind: "camera" as const, href: `/cameras/${m.slug}` }));
  const projectors = getProjectorRecords().map((m) => ({
    m,
    kind: "projector" as const,
    href: `/projectors/${m.slug}`,
  }));

  return [...cameras, ...projectors]
    .filter(({ m }) => m.serialRows.length > 0)
    .map(({ m, kind, href }) => ({
      slug: m.slug,
      name: m.name,
      format: m.format,
      href,
      kind,
      rows: m.serialRows,
      tells: deriveTells(m.format, m.specs),
    }));
}
