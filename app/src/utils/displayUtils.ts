/**
 * displayUtils.ts
 * ---------------
 * Display-only helpers for cleaning WordPress HTML content.
 * These functions never modify raw data — they only transform strings
 * at the point of rendering to the screen.
 */

/**
 * Strip HTML tags and decode common WordPress HTML entities.
 * Safe to use on title.rendered, content.rendered, excerpt.rendered, etc.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "\u2013")   // en dash –
    .replace(/&#8212;/g, "\u2014")   // em dash —
    .replace(/&#8216;/g, "\u2018")   // left single quote '
    .replace(/&#8217;/g, "\u2019")   // right single quote '
    .replace(/&#8220;/g, "\u201C")   // left double quote "
    .replace(/&#8221;/g, "\u201D")   // right double quote "
    .replace(/&#8230;/g, "\u2026")   // ellipsis …
    .trim();
}
