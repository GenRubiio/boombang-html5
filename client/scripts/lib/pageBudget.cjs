// design.md §5.4/§6: the three page-budget gates re-derived for the full roster. Pure
// threshold logic — the compiler prints the measurement and calls this per pack
// (base/action/accessory) with that pack's own thresholds.

/**
 * @param {number} pageCount
 * @param {{warnAt?: number, failAbove: number}} thresholds `warnAt` is optional (the base pack
 *   has no separate warn tier — it just fails above 2).
 * @returns {{warned: boolean, message: string|null}}
 * @throws {Error} when `pageCount > failAbove`
 */
function checkPageBudget(pageCount, { warnAt, failAbove }) {
  if (pageCount > failAbove) {
    throw new Error(
      `page budget exceeded: ${pageCount} pages exceeds the maximum of ${failAbove} (design.md §5.4/§6)`
    );
  }
  if (warnAt !== undefined && pageCount > warnAt) {
    return {
      warned: true,
      message: `page budget warning: ${pageCount} pages exceeds the recommended ${warnAt} (design.md §5.4/§6)`,
    };
  }
  return { warned: false, message: null };
}

module.exports = { checkPageBudget };
