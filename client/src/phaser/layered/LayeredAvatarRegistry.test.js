import { describe, it, expect, vi } from 'vitest'
import LayeredAvatarRegistry from './LayeredAvatarRegistry.js'

// design.md §5 cost 3: one scene-level tick drives every live LayeredAvatar's animation
// clock. Exercised here with plain-object doubles (tick is duck-typed) rather than a real
// Phaser Container — no Phaser instantiation in unit tests (design.md §8).
describe('LayeredAvatarRegistry', () => {
  it('ticks every registered avatar with the same delta', () => {
    const registry = new LayeredAvatarRegistry()
    const avatarA = { tick: vi.fn() }
    const avatarB = { tick: vi.fn() }
    registry.register(avatarA)
    registry.register(avatarB)

    registry.update(1000, 16)

    expect(avatarA.tick).toHaveBeenCalledWith(16)
    expect(avatarB.tick).toHaveBeenCalledWith(16)
    expect(registry.size).toBe(2)
  })

  it('stops ticking an avatar once it is unregistered', () => {
    const registry = new LayeredAvatarRegistry()
    const avatar = { tick: vi.fn() }
    registry.register(avatar)
    registry.unregister(avatar)

    registry.update(1000, 16)

    expect(avatar.tick).not.toHaveBeenCalled()
    expect(registry.size).toBe(0)
  })
})
