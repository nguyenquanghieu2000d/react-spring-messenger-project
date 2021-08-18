export const playNotificationSound = () => {
    let newMessage = new Audio("/assets/sounds/new_message.mp3")
    newMessage.play();
}