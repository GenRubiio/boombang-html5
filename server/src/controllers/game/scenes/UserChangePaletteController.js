const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const UserPaletteService = require('../../../services/UserPaletteService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const Log = require('../../../utils/Log');

// Design invariant (design.md §6, PROTO2): this controller MUST NOT import
// DisconnectUserController. Every branch — success, functional rejection, or an unexpected
// thrown error — resolves to a functional ACK on the `_ack` channel; the socket session is
// never disconnected as a result of a palette change request.
class UserChangePaletteController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                socket.emit(ResponseSocketsEnum.USER_CHANGE_PALETTE_ACK, {
                    success: false,
                    code: 'NOT_OWNED',
                    message: 'User not found or not in any area',
                });
                return;
            }

            const avatarId = parseInt(data.avatarId, 10);

            // Ownership check, same pattern as UserChangeAvatarController.js:18
            // (`user.avatars.includes(data.avatar)`) — a palette only makes sense for an
            // avatar the user actually owns.
            if (!user.avatars.includes(String(avatarId))) {
                socket.emit(ResponseSocketsEnum.USER_CHANGE_PALETTE_ACK, {
                    success: false,
                    code: 'NOT_OWNED',
                    message: `Avatar ${avatarId} is not owned by this user`,
                });
                return;
            }

            const slots = data.slots || {};
            const slotKeys = Object.keys(slots);

            if (slotKeys.length === 0) {
                socket.emit(ResponseSocketsEnum.USER_CHANGE_PALETTE_ACK, {
                    success: false,
                    code: 'INVALID_VALUE',
                    message: 'No slots submitted',
                });
                return;
            }

            // PROTO1: the server is the sole authority — each slot is independently
            // re-validated by UserPaletteService regardless of what the client's UI allowed.
            for (const slotKey of slotKeys) {
                const result = await UserPaletteService.changeSlot(user, avatarId, slotKey, slots[slotKey]);
                if (!result.success) {
                    socket.emit(ResponseSocketsEnum.USER_CHANGE_PALETTE_ACK, {
                        success: false,
                        code: result.code,
                        message: result.message,
                    });
                    return;
                }
            }

            // Broadcast targeting fix (proposal.md risk 3, design.md §6): carries socketId so
            // an observing client resolves gameScene.users[data.socketId] directly, reaching
            // both immediate-load and fallback/upgrade-load avatars (PROTO3).
            user.currentArea.emit(ResponseSocketsEnum.USER_CHANGE_PALETTE, {
                socketId: socket.id,
                avatarId,
                slots: user.avatarPalettes[avatarId],
            });

            socket.emit(ResponseSocketsEnum.USER_CHANGE_PALETTE_ACK, {
                success: true,
                code: null,
                message: null,
            });
        } catch (err) {
            Log.error('Error in UserChangePaletteController: ' + err);
            socket.emit(ResponseSocketsEnum.USER_CHANGE_PALETTE_ACK, {
                success: false,
                code: 'INVALID_VALUE',
                message: 'Unexpected error processing palette change',
            });
        }
    }
}

module.exports = UserChangePaletteController;
