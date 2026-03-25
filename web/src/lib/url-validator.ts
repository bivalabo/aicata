/**
 * SSRF Protection: URL Validator
 *
 * Prevents Server-Side Request Forgery attacks by blocking:
 * - Private IP ranges (RFC 1918, loopback, link-local, ULA)
 * - Non-HTTP(S) protocols
 * - Localhost and internal domains
 */

/**
 * Result of URL validation
 */
export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates an external URL to prevent SSRF attacks
 *
 * Blocks:
 * - Private IPv4: 10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x
 * - Private IPv6: ::1 (loopback), fc00::/7 (ULA), fe80::/10 (link-local)
 * - Non-HTTP(S) protocols
 * - localhost, *.local, *.internal domains
 *
 * @param url - The URL string to validate
 * @returns ValidationResult with valid flag and optional reason
 */
export function validateExternalUrl(url: string): ValidationResult {
  // Parse URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      valid: false,
      reason: "Invalid URL format",
    };
  }

  // Check protocol
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return {
      valid: false,
      reason: `Only http:// and https:// are allowed. Got: ${parsed.protocol}`,
    };
  }

  // Check hostname
  const hostname = parsed.hostname;
  if (!hostname) {
    return {
      valid: false,
      reason: "URL missing hostname",
    };
  }

  // Reject localhost
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]"
  ) {
    return {
      valid: false,
      reason: "localhost is not allowed",
    };
  }

  // Reject .local and .internal domains
  if (hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return {
      valid: false,
      reason: `.local and .internal domains are not allowed. Got: ${hostname}`,
    };
  }

  // Check for private IP ranges
  const ipCheck = isPrivateIP(hostname);
  if (ipCheck.isPrivate) {
    return {
      valid: false,
      reason: `Private IP address not allowed: ${hostname} (${ipCheck.reason})`,
    };
  }

  return { valid: true };
}

/**
 * Checks if a hostname is a private IP address
 *
 * @param hostname - The hostname or IP address to check
 * @returns Object with isPrivate flag and reason if private
 */
function isPrivateIP(hostname: string): { isPrivate: boolean; reason?: string } {
  // Try to parse as IPv4
  const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const [, a, b, c, d] = ipv4Match.map(Number);

    // 127.0.0.0/8 - Loopback
    if (a === 127) {
      return { isPrivate: true, reason: "loopback (127.x.x.x)" };
    }

    // 10.0.0.0/8 - Private
    if (a === 10) {
      return { isPrivate: true, reason: "private (10.x.x.x)" };
    }

    // 172.16.0.0/12 - Private
    if (a === 172 && b >= 16 && b <= 31) {
      return { isPrivate: true, reason: "private (172.16-31.x.x)" };
    }

    // 192.168.0.0/16 - Private
    if (a === 192 && b === 168) {
      return { isPrivate: true, reason: "private (192.168.x.x)" };
    }

    // 169.254.0.0/16 - Link-local
    if (a === 169 && b === 254) {
      return { isPrivate: true, reason: "link-local (169.254.x.x)" };
    }

    // 0.0.0.0/8 - Current network
    if (a === 0) {
      return { isPrivate: true, reason: "current network (0.0.0.0/8)" };
    }

    // 224.0.0.0/4 - Multicast
    if (a >= 224 && a <= 239) {
      return { isPrivate: true, reason: "multicast (224-239.x.x.x)" };
    }

    // 255.255.255.255 - Broadcast
    if (a === 255 && b === 255 && c === 255 && d === 255) {
      return { isPrivate: true, reason: "broadcast (255.255.255.255)" };
    }

    return { isPrivate: false };
  }

  // Try to parse as IPv6
  const ipv6Check = isPrivateIPv6(hostname);
  if (ipv6Check !== null) {
    return {
      isPrivate: ipv6Check,
      reason: ipv6Check ? "private IPv6 range" : undefined,
    };
  }

  // Not an IP address; assume public (unless matched by domain filters above)
  return { isPrivate: false };
}

/**
 * Checks if a string is a private IPv6 address
 *
 * @param hostname - The hostname to check (may contain brackets)
 * @returns true if private, false if public, null if not IPv6
 */
function isPrivateIPv6(hostname: string): boolean | null {
  // Remove brackets if present
  let addr = hostname;
  if (addr.startsWith("[") && addr.endsWith("]")) {
    addr = addr.slice(1, -1);
  }

  // Check for IPv6-like format (colon present)
  if (!addr.includes(":")) {
    return null;
  }

  // Loopback: ::1
  if (addr === "::1") {
    return true;
  }

  // Compress and normalize for comparison
  // Note: full IPv6 parsing is complex; use simple heuristics
  const lowerAddr = addr.toLowerCase();

  // fc00::/7 - Unique local addresses (ULA)
  if (lowerAddr.startsWith("fc") || lowerAddr.startsWith("fd")) {
    return true;
  }

  // fe80::/10 - Link-local
  if (lowerAddr.startsWith("fe80")) {
    return true;
  }

  // ff00::/8 - Multicast
  if (lowerAddr.startsWith("ff")) {
    return true;
  }

  return false;
}
