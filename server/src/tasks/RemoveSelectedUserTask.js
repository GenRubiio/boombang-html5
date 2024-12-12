
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const UserResource = require('../resources/UserResource');

class RemoveSelectedUserTask {
    static main(user) {
        try {
            const area = user.currentArea;
            if (!area) return;
            for (let i = 0; i < area.users.length; i++) {
                const u = area.users[i];
                if (u.selectedUser && u.selectedUser.id === user.id) {
                    u.setSelectedUser(null);
                    u.emit('response:user_select_user', {
                        selected_user: new UserResource(u).toObject()
                    });
                }
            }
        }
        catch (err) {
            console.log(err);
            logger.log(`Error removing selected user: ${err.message}`, 'error');
        }
    }
}

module.exports = RemoveSelectedUserTask;