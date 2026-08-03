// A fixed-window, in-memory request counter.
//
// Deliberately modest in what it claims. It exists to slow down casual spam through our
// own POST route, which is the only layer that can still see the real client — the
// backend sits behind this server and sees a single IP for the entire audience. It is
// NOT a security boundary: the state is per-instance and resets on every deploy, and the
// key it gets handed comes from a header that can be forged. The shared token is what
// actually gates writing.

/**
 * @param {object} options
 * @param {number} options.limit    requests allowed per key per window
 * @param {number} options.windowMs window length in milliseconds
 * @param {number} [options.maxKeys] when the map grows past this, sweep every key
 */
export const createRateLimiter = ({ limit, windowMs, maxKeys = 10000 }) => {
  // key -> timestamps of the requests still inside the window
  const hits = new Map();

  const prune = (key, since) => {
    const live = (hits.get(key) ?? []).filter((time) => time > since);
    if (live.length) hits.set(key, live);
    else hits.delete(key);
    return live;
  };

  return {
    /**
     * Whether this request is allowed — and records it when it is.
     * `now` is injectable so the window logic is testable without waiting an hour.
     */
    check(key, now = Date.now()) {
      const since = now - windowMs;
      // Sweep everything only once the map has actually grown, so a busy instance
      // doesn't pay to re-scan every idle key it has ever seen.
      if (hits.size > maxKeys) {
        for (const seen of [...hits.keys()]) prune(seen, since);
      }
      const live = prune(key, since);
      if (live.length >= limit) return false;
      hits.set(key, [...live, now]);
      return true;
    },
  };
};
