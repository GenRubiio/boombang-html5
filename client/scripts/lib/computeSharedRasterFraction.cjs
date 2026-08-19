// design.md §13.6 (tasks.md slice 18 task 1): pure comparison over content-hash sets, one per
// compiled package. An "instance" is one (package, hash) pairing — a hash present in 2
// packages counts as 2 instances, one of which is "shared" and one of which... both are shared,
// since sharing is symmetric between the packages that hold it. `sharedFraction` is the
// fraction of all instances whose hash appears in 2 or more packages.

/**
 * @param {Record<string, Set<string>>} packageHashSets package name -> set of content hashes
 *   (one per run raster the real script content-hashes, design.md §13.6).
 * @returns {{inconclusive: true, reason: string} | {inconclusive: false, totalInstances: number, sharedInstances: number, sharedFraction: number}}
 */
function computeSharedRasterFraction(packageHashSets) {
  const packageNames = Object.keys(packageHashSets);
  if (packageNames.length < 2) {
    return {
      inconclusive: true,
      reason: 'needs at least 2 packages to measure any overlap — with only one, there is nothing to share with yet',
    };
  }

  const hashCounts = new Map();
  let totalInstances = 0;
  for (const name of packageNames) {
    for (const hash of packageHashSets[name]) {
      hashCounts.set(hash, (hashCounts.get(hash) || 0) + 1);
      totalInstances += 1;
    }
  }

  let sharedInstances = 0;
  for (const count of hashCounts.values()) {
    if (count >= 2) sharedInstances += count;
  }

  return {
    inconclusive: false,
    totalInstances,
    sharedInstances,
    sharedFraction: totalInstances === 0 ? 0 : sharedInstances / totalInstances,
  };
}

module.exports = { computeSharedRasterFraction };
