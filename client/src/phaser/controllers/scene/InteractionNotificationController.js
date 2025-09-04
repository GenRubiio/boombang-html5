import socket from "@/sockets/socket.js";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";
import ResponseSocketsEnum from "@/enums/ResponseSocketsEnum";

class InteractionNotificationController {
    static notifications = new Map(); // Store active notifications by user socket ID

    static create(gameScene, data) {
        const { type, fromUser } = data;

        console.log('Creating notification for interaction:', { fromUser, type });
        console.log('Receiver userData:', data);
        console.log('Available users in scene:', Object.keys(gameScene.users));

        // Use fromUser directly since that's what we have in gameScene.users
        const senderSocketId = fromUser;

        if (!senderSocketId || !gameScene.users[senderSocketId]) {
            console.log('❌ Sender sprite not found for fromUser:', fromUser);
            console.log('Available users:', Object.keys(gameScene.users));
            return;
        }

        console.log('✅ Found sender socketId:', senderSocketId);

        // Check if notification already exists - don't remove it, just return
        if (this.notifications.has(senderSocketId)) {
            console.log('Notification already exists for sender:', senderSocketId);
            return this.notifications.get(senderSocketId).container;
        }

        // Create notification container
        const notificationContainer = gameScene.add.container(0, 0);

        // Create background using the loaded image
        const background = gameScene.add.image(0, 0, 'asset_interaction_background_image');
        background.setScale(0.8); // Adjust scale as needed
        background.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        // Create orange circle border for interaction icon
        const orangeCircle = gameScene.add.graphics();
        orangeCircle.lineStyle(3, 0xFF8C00, 1); // Orange border only
        orangeCircle.strokeCircle(-40, -10, 25); // Circle at same position as icon

        // Create interaction image based on type
        let interactionImage;
        switch (type) {
            case 'kiss':
                interactionImage = gameScene.add.image(-40, -10, 'asset_kiss_image');
                break;
            case 'drink':
                interactionImage = gameScene.add.image(-40, -10, 'asset_drink_image');
                break;
            case 'rose':
                interactionImage = gameScene.add.image(-40, -10, 'asset_rose_image');
                break;
            default:
                interactionImage = gameScene.add.image(-40, -10, 'asset_kiss_image');
        }
        
        // Apply anti-aliasing and smooth scaling to fix pixelation
        interactionImage.setScale(1.2);
        interactionImage.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        // Create Accept button (positioned vertically stacked)
        const acceptButton = this.createButton(gameScene, 30, -10, '✓', 0x00ff00, () => {
            this.acceptInteraction(senderSocketId);
        });

        // Create Reject button (positioned below accept button)
        const rejectButton = this.createButton(gameScene, 30, 15, '✗', 0xff0000, () => {
            this.rejectInteraction(senderSocketId);
        });

        // Add all elements to container
        notificationContainer.add([background, orangeCircle, interactionImage, acceptButton, rejectButton]);

        // Position above sender's sprite (who sent the interaction) like createUserNameText
        const senderSprite = gameScene.users[senderSocketId];
        console.log('Sender sprite:', senderSprite);
        if (senderSprite && senderSprite.containerUser) {
            console.log('Positioning notification at:', senderSprite.containerUser.x, senderSprite.containerUser.y - 80);

            // Add notification to the sender's containerUser so it moves with the user
            senderSprite.containerUser.add(notificationContainer);

            // Position relative to the container (higher and behind name text)
            notificationContainer.x = 0; // Centered on user
            notificationContainer.y = -160; // Higher position, behind name text
            notificationContainer.setDepth(-1); // Behind name text

            console.log('✅ Notification container added to sender containerUser');
        } else {
            console.log('❌ Sender sprite not found for socket_id:', senderSocketId);
            console.log('Available users:', Object.keys(gameScene.users));
            console.log('Sender sprite structure:', senderSprite);
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

    static createButton(gameScene, x, y, text, color, callback) {
        const button = gameScene.add.container(x, y);

        const bg = gameScene.add.graphics();
        bg.fillStyle(color, 0.8);
        bg.fillCircle(0, 0, 12);
        bg.lineStyle(1, 0xffffff, 1);
        bg.strokeCircle(0, 0, 12);

        const buttonText = gameScene.add.text(0, 0, text, {
            fontSize: '14px',
            fill: '#ffffff',
            fontWeight: 'bold',
            resolution: 2 // Fix pixelation
        }).setOrigin(0.5);

        button.add([bg, buttonText]);
        button.setInteractive(new Phaser.Geom.Circle(0, 0, 12), Phaser.Geom.Circle.Contains);

        // Set higher depth to ensure button is above floor zone
        button.setDepth(1000);

        // Add cursor pointer style
        button.on('pointerover', () => {
            gameScene.input.setDefaultCursor('pointer');
            bg.clear();
            bg.fillStyle(color, 1);
            bg.fillCircle(0, 0, 12);
            bg.lineStyle(2, 0xffffff, 1);
            bg.strokeCircle(0, 0, 12);
        });
        
        button.on('pointerout', () => {
            gameScene.input.setDefaultCursor('default');
            bg.clear();
            bg.fillStyle(color, 0.8);
            bg.fillCircle(0, 0, 12);
            bg.lineStyle(1, 0xffffff, 1);
            bg.strokeCircle(0, 0, 12);
        });

        button.on('pointerdown', callback);

        return button;
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