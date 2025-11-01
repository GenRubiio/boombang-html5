const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PrivateSceneApiService = require('../../../services-api/PrivateSceneApiService');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const PrivateScenesCollection = require('../../../collections/PrivateScenesCollection');
const PrivateSceneModel = require('../../../models/PrivateSceneModel');

class JoinPrivateSceneController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.currentArea) return;

            const response = await PrivateSceneApiService.join({
                scene_id: data.sceneId,
                password: data.password
            }, user);

            if (!response.success) {
                throw new Error('Failed to join private scene');
            };

            let scene = PrivateScenesCollection.getById(data.sceneId);
            if (!scene) {
                scene = new PrivateSceneModel(response.scene.id, response.scene);
                PrivateScenesCollection.add(scene.id, scene);
            }
            if (scene.containsUser(user) || user.currentArea) {
                //throw new Error("User already in area");
                return;
            }

            // Salir de la room de la isla cuando entra a una escena privada
            const rooms = Array.from(socket.rooms);
            rooms.forEach(room => {
                if (room.startsWith('island_')) {
                    socket.leave(room);
                }
            });

            await scene.userJoin(user, response.user_inventory_items || [], response.scene_config || {});
        } catch (err) {
            console.error('Error in JoinPrivateSceneController:', err);
            Log.error('Error in JoinPrivateSceneController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = JoinPrivateSceneController;