/**
 * The archive's single donation destination.
 *
 * The link points at the recipient organization's *own* PayPal donate button,
 * so funds travel from the donor straight to them. This site never collects,
 * holds, forwards, or takes a cut of anything — which is why the page can say
 * so plainly. Retargeting the link means editing this one constant.
 */
export const SUPPORT = {
  /**
   * Display name of the recipient. Must match the name PayPal shows on the
   * donate page, so a donor can confirm at a glance that they're in the right
   * place before entering an amount.
   */
  organization: "Coast Communities Film Society",

  /** Short description of what the donation supports. */
  purpose: "putting cameras, film, and mentorship into the hands of filmmakers in rural and coastal communities",

  /** The organization's own PayPal hosted donate button. */
  donateUrl: "https://www.paypal.com/donate/?hosted_button_id=GT9JKQ5VPN3RA",
} as const;
