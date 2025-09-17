import socket from "@/sockets/socket.js";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";

class InteractionNotificationController {
    static notifications = new Map(); // Store active notifications by user socket ID

    static create(gameScene, data) {
        const { type, fromUser } = data;

        // Use fromUser directly since that's what we have in gameScene.users
        const senderSocketId = fromUser;

        if (!senderSocketId || !gameScene.users[senderSocketId]) {
            return;
        }
        // Check if notification already exists - don't remove it, just return
        if (this.notifications.has(senderSocketId)) {
            return this.notifications.get(senderSocketId).container;
        }

        // Create notification container
        const notificationContainer = gameScene.add.container(0, 0);

        // Create background using the loaded image
        const background = gameScene.add.image(0, 0, 'asset_interaction_background_image');
        background.setScale(0.9); // Adjust scale as needed
        background.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        // Orange circle removed as requested

        // Create interaction image based on type
        let interactionImage;
        switch (type) {
            case 'kiss':
                interactionImage = gameScene.add.image(-15 * 2, -5 * 2, 'asset_kiss_image');
                break;
            case 'drink':
                interactionImage = gameScene.add.image(-15 * 2, -5 * 2, 'asset_drink_image');
                break;
            case 'rose':
                interactionImage = gameScene.add.image(-15 * 2, -5 * 2, 'asset_rose_image');
                break;
            default:
                interactionImage = gameScene.add.image(-15 * 2, -5 * 2, 'asset_kiss_image');
        }

        // Apply anti-aliasing and smooth scaling to fix pixelation
        interactionImage.setScale(1);
        interactionImage.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        // Create Accept button using image asset
        const acceptButton = gameScene.add.image(30 * 2, -15 * 2, 'asset_accept_image');
        acceptButton.setScale(1);
        acceptButton.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        acceptButton.setInteractive();
        acceptButton.setDepth(1000);

        // Add hover effects for accept button
        acceptButton.on('pointerover', () => {
            gameScene.input.setDefaultCursor('pointer');
            acceptButton.setScale(1);
        });

        acceptButton.on('pointerout', () => {
            gameScene.input.setDefaultCursor('default');
            acceptButton.setScale(1);
        });

        acceptButton.on('pointerdown', () => {
            gameScene.input.setDefaultCursor('default');
            this.acceptInteraction(senderSocketId);
        });

        // Create Reject button using image asset
        const rejectButton = gameScene.add.image(30 * 2, 10 * 2, 'asset_reject_image');
        rejectButton.setScale(1);
        rejectButton.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        rejectButton.setInteractive();
        rejectButton.setDepth(1000);

        // Add hover effects for reject button
        rejectButton.on('pointerover', () => {
            gameScene.input.setDefaultCursor('pointer');
            rejectButton.setScale(1);
        });

        rejectButton.on('pointerout', () => {
            gameScene.input.setDefaultCursor('default');
            rejectButton.setScale(1);
        });

        rejectButton.on('pointerdown', () => {
            gameScene.input.setDefaultCursor('default');
            this.rejectInteraction(senderSocketId);
        });

        // Add all elements to container
        notificationContainer.add([background, interactionImage, acceptButton, rejectButton]);

        // Position above sender's sprite (who sent the interaction) like createUserNameText
        const senderSprite = gameScene.users[senderSocketId];
        if (senderSprite && senderSprite.containerUser) {
            // Add notification to the sender's containerUser so it moves with the user
            senderSprite.containerUser.add(notificationContainer);

            // Position relative to the container (higher and behind name text)
            notificationContainer.x = 0; // Centered on user
            notificationContainer.y = -160 * 2; // Higher position, behind name text
            notificationContainer.setDepth(-1); // Behind name text
        } else {
            return;
        }

        // Store notification with sender's socket ID so it follows the sender
        this.notifications.set(senderSocketId, {
            container: notificationContainer,
            fromUser: fromUser,
            type: type,
        });

        return notificationContainer;
    }


    static acceptInteraction(senderSocketId) {
        socket.emit(RequestSocketsEnum.USER_ACCEPT_INTERACTION, {
            fromUser: senderSocketId
        });
    }

    static rejectInteraction(senderSocketId) {
        socket.emit(RequestSocketsEnum.USER_REJECT_INTERACTION, {
            fromUser: senderSocketId
        });
        this.remove(senderSocketId);
    }

    static remove(userSocketId) {
        const notification = this.notifications.get(userSocketId);
        if (notification) {
            // Remove from parent container before destroying
            if (notification.container.parentContainer) {
                notification.container.parentContainer.remove(notification.container);
            }
            notification.container.destroy();
            this.notifications.delete(userSocketId);
        }
    }

    static removeAll(gameScene) {
        this.notifications.forEach((notification, userSocketId) => {
            this.remove(gameScene, userSocketId);
        });
    }
}

export default InteractionNotificationController;