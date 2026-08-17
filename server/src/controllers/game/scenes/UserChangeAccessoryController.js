const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const UserApiService = require('../../../services-api/UserApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const Log = require('../../../utils/Log');

const VALID_KINDS = ['hat', 'pet', 'aura'];

// Design invariant (design.md §6, PROTO2): this controller MUST NOT import
// DisconnectUserController — same functional-ACK, never-disconnect shape as
// UserChangePaletteController.js (Slice 5), reused here for accessories (ACC3).
class UserChangeAccessoryController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                socket.emit(ResponseSocketsEnum.USER_CHANGE_ACCESSORY_ACK, {
                    success: false,
                    code: 'NOT_OWNED',
                    message: 'User not found or not in any area',
                });
                return;
            }

            const kind = data.kind;
            const value = data.value ?? null;

            if (!VALID_KINDS.includes(kind)) {
                socket.emit(ResponseSocketsEnum.USER_CHANGE_ACCESSORY_ACK, {
                    success: false,
                    code: 'UNKNOWN_SLOT',
                    message: `Unknown accessory kind "${kind}"`,
                });
                return;
            }

            // PROTO1: server-authoritative ownership check — never trust the client's <select>.
            if (value !== null && !(user.ownedAccessories[kind] || []).includes(value)) {
                socket.emit(ResponseSocketsEnum.USER_CHANGE_ACCESSORY_ACK, {
                    success: false,
                    code: 'NOT_OWNED',
                    message: `Accessory "${value}" is not owned by this user`,
                });
                return;
            }

            await UserApiService.changeAccessory(user, kind, value);
            user.accessories[kind] = value;

            // Broadcast targeting (PROTO3, same shape as the palette broadcast, Slice 5):
            // carries socketId so an observing client resolves gameScene.users[data.socketId]
            // directly, reaching both immediate-load and fallback/upgrade-load avatars.
            user.currentArea.emit(ResponseSocketsEnum.USER_CHANGE_ACCESSORY, {
                socketId: socket.id,
                kind,
                value,
            });

            socket.emit(ResponseSocketsEnum.USER_CHANGE_ACCESSORY_ACK, {
                success: true,
                code: null,
                message: null,
            });
        } catch (err) {
            Log.error('Error in UserChangeAccessoryController: ' + err);
            socket.emit(ResponseSocketsEnum.USER_CHANGE_ACCESSORY_ACK, {
                success: false,
                code: 'INVALID_VALUE',
                message: 'Unexpected error processing accessory change',
            });
        }
    }

    static async getAccessories(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) return;

            socket.emit(ResponseSocketsEnum.GET_USER_ACCESSORIES, {
                owned: user.ownedAccessories,
                equipped: user.accessories,
            });
        } catch (err) {
            Log.error('Error in UserChangeAccessoryController.getAccessories: ' + err);
        }
    }
}

module.exports = UserChangeAccessoryController;
