// design.md §13.3 (tasks.md slice 15 task 8): pure eviction-timer decision, complementing
// per-key packing (which caps peak transfer/memory per trigger) by capping CONCURRENT
// residency — an action page nobody has used for `thresholdMs` is a release candidate. The
// actual `scene.textures.remove(atlasKey)` call is the I/O shell.

/**
 * @param {number|null} lastUsedAt a timestamp (ms), or `null` if this page has never been
 *   marked used (e.g. eviction bookkeeping was only just wired up) — never evicted in that case.
 * @param {number} now current timestamp (ms)
 * @param {number} thresholdMs how long a page may sit idle before it becomes eligible
 * @returns {boolean}
 */
function shouldEvictPage(lastUsedAt, now, thresholdMs) {
  if (lastUsedAt == null) return false;
  return now - lastUsedAt >= thresholdMs;
}

export { shouldEvictPage };
