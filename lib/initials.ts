/**
 * Derive a 2-letter uppercase initials string from a name and/or email.
 *
 * Rules (in order):
 * 1. If `name` has 2+ tokens, take first letter of first + first letter of last.
 * 2. If `name` has 1 token, take first 2 letters of that token.
 * 3. If `name` is empty, fall back to local-part of `email` and apply same rules.
 * 4. Otherwise return `"AD"`.
 */
export function getInitials(name?: string | null, email?: string | null): string {
  const fromName = _initialsFrom(name);
  if (fromName) return fromName;

  const localPart = email?.split("@")[0]?.replace(/[._\-+]/g, " ");
  const fromEmail = _initialsFrom(localPart);
  if (fromEmail) return fromEmail;

  return "AD";
}

function _initialsFrom(raw?: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.trim();
  if (!cleaned) return null;

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    return (tokens[0][0] + tokens[tokens.length - 1][0]).toUpperCase();
  }
  const single = tokens[0];
  if (single.length >= 2) {
    return single.slice(0, 2).toUpperCase();
  }
  return single[0].toUpperCase().padEnd(2, single[0].toUpperCase());
}
