import socket from "@/sockets/socket.js";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import gameConfig from "@/config/gameConfig.js";

class InteractionNotificationController {
    static notifications = new Map(); // Store active notifications by user socket ID

    static create(gameScene, data) {
        const { type, fromUser } = data;

        // Use fromUser directly since that's what we have in gameScene.users
        const senderSocketId = fromUser;

        if (!senderSocketId || !gameScene.users[senderSocketId]) {
            console.warn(`InteractionNotificationController: Sender user not found for socketId: ${senderSocketId}`);
            return null;
        }
        // Check if notification already exists - don't remove it, just return
        if (this.notifications.has(senderSocketId)) {
            return this.notifications.get(senderSocketId).container;
        }

        // Aplicar factor de escala para big_scene
        const scaleFactor = gameScene.sceneScaleFactor || 1;

        // Create notification container
        const notificationContainer = gameScene.add.container(0, 0);

        // Create background using the loaded image
        const background = gameScene.add.image(0, 0, 'asset_interaction_background_image');
        background.setScale(0.9 * scaleFactor); // Adjust scale as needed
        background.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        // Orange circle removed as requested

        // Create interaction image based on type
        let interactionImage;
        switch (type) {
            case 'kiss':
                interactionImage = gameScene.add.image(-15 * gameConfig.DPI * scaleFactor, -5 * gameConfig.DPI * scaleFactor, 'asset_kiss_image');
                break;
            case 'drink':
                interactionImage = gameScene.add.image(-15 * gameConfig.DPI * scaleFactor, -5 * gameConfig.DPI * scaleFactor, 'asset_drink_image');
                break;
            case 'rose':
                interactionImage = gameScene.add.image(-15 * gameConfig.DPI * scaleFactor, -5 * gameConfig.DPI * scaleFactor, 'asset_rose_image');
                break;
            default:
                interactionImage = gameScene.add.image(-15 * gameConfig.DPI * scaleFactor, -5 * gameConfig.DPI * scaleFactor, 'asset_kiss_image');
        }

        // Apply anti-aliasing and smooth scaling to fix pixelation
        interactionImage.setScale(scaleFactor);
        interactionImage.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        // Create Accept button using image asset
        const acceptButton = gameScene.add.image(30 * gameConfig.DPI * scaleFactor, -15 * gameConfig.DPI * scaleFactor, 'asset_accept_image');
        acceptButton.setScale(scaleFactor);
        acceptButton.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        acceptButton.setInteractive();
        acceptButton.setDepth(1000);

        // Add hover effects for accept button
        acceptButton.on('pointerover', () => {
            gameScene.input.setDefaultCursor('pointer');
            acceptButton.setScale(scaleFactor);
        });

        acceptButton.on('pointerout', () => {
            gameScene.input.setDefaultCursor('default');
            acceptButton.setScale(scaleFactor);
        });

        acceptButton.on('pointerdown', () => {
            gameScene.input.setDefaultCursor('default');
            this.acceptInteraction(senderSocketId);
        });

        // Create Reject button using image asset
        const rejectButton = gameScene.add.image(30 * gameConfig.DPI * scaleFactor, 10 * gameConfig.DPI * scaleFactor, 'asset_reject_image');
        rejectButton.setScale(scaleFactor);
        rejectButton.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        rejectButton.setInteractive();
        rejectButton.setDepth(1000);

        // Add hover effects for reject button
        rejectButton.on('pointerover', () => {
            gameScene.input.setDefaultCursor('pointer');
            rejectButton.setScale(scaleFactor);
        });

        rejectButton.on('pointerout', () => {
            gameScene.input.setDefaultCursor('default');
            rejectButton.setScale(scaleFactor);
        });

        rejectButton.on('pointerdown', () => {
            gameScene.input.setDefaultCursor('default');
            this.rejectInteraction(senderSocketId);
        });

        // Add all elements to container
        notificationContainer.add([background, interactionImage, acceptButton, rejectButton]);

        // Position above sender's sprite (who is sending the interaction)
        // The notification should appear above the sender, not the receiver
        const senderSprite = gameScene.users[senderSocketId];
        if (senderSprite && senderSprite.containerUser) {
            // Add notification to the sender's containerUser so it moves with them
            senderSprite.containerUser.add(notificationContainer);

            // Position relative to the container (higher and behind name text)
            notificationContainer.x = 0; // Centered on user
            notificationContainer.y = -160 * gameConfig.DPI * scaleFactor; // Higher position, behind name text
            notificationContainer.setDepth(-1); // Behind name text
        } else {
            // If sender sprite doesn't exist, clean up and return
            notificationContainer.destroy();
            return null;
        }

        // Store notification with sender's socket ID for tracking purposes
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
            this.remove(userSocketId);
        });
    }

    static clearAll() {
        this.notifications.clear();
    }
}

export default InteractionNotificationController;