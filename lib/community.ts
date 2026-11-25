/**
 * Where Bolex owners actually talk to each other.
 *
 * Deliberately short. A links list is only useful if every entry is somewhere
 * that still has people in it, and a dead forum is worse than no link — so
 * nothing goes here that was not opened and found alive.
 *
 * No Bolex subreddit is listed because none could be confirmed; r/Filmmakers
 * and r/AnalogCommunity carry occasional Bolex threads but are not Bolex
 * communities, and listing them as such would be a small lie.
 */
export const FACEBOOK_GROUP_URL = "https://www.facebook.com/groups/746982282801800";

export interface CommunityLink {
  href: string;
  label: string;
  blurb: string;
}

export const COMMUNITY_LINKS: readonly CommunityLink[] = [
  {
    href: FACEBOOK_GROUP_URL,
    label: "Bolex group on Facebook",
    blurb:
      "The busiest place for Bolex owners: manuals, repair advice, and what people have just found.",
  },
  {
    href: "https://www.filmshooting.com/scripts/forum/",
    label: "filmshooting.com",
    blurb: "Small-gauge film forum with a long-running 16mm section.",
  },
  {
    href: "https://8mmforum.film-tech.com/",
    label: "8mm Forum",
    blurb: "Projectors, splicers and the mechanics of running small-gauge film.",
  },
  {
    href: "https://www.photrio.com/forum/",
    label: "Photrio",
    blurb: "Film photography forums, with a motion-picture corner.",
  },
];
