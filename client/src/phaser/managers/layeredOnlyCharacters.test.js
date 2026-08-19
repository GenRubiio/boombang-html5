// design.md §15 (tasks.md slice 10 task 2): `LAYERED_ONLY_CHARACTERS` — a character with no
// baked art at all (sally). With the layered flag off, or the layered package failing to
// resolve, `AvatarManager.loadAvatar` must reject immediately instead of falling through to a
// baked loader that was never registered — an explicit, unit-testable rule, not an accident of
// a missing map entry (design.md §15).

import { describe, it, expect } from 'vitest';
import { shouldRejectAsLayeredOnly } from './layeredOnlyCharacters.js';

describe('shouldRejectAsLayeredOnly', () => {
  const LAYERED_ONLY = new Set([18]); // AvatarEnum.SALLY

  it('rejects when the character is layered-only and the layered path is not currently usable', () => {
    expect(shouldRejectAsLayeredOnly(18, false, LAYERED_ONLY)).toBe(true);
  });

  it('does not reject when the character is layered-only but the layered path IS usable (flag on, package resolved)', () => {
    expect(shouldRejectAsLayeredOnly(18, true, LAYERED_ONLY)).toBe(false);
  });

  it('does not reject an ordinary character with baked art, even with the layered path unusable', () => {
    expect(shouldRejectAsLayeredOnly(12, false, LAYERED_ONLY)).toBe(false); // AvatarEnum.RASTA
  });
});
