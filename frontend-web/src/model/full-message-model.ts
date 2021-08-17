export class FullMessageModel {
    id: number
    type: string
    message: string
    url: string
    userId: number
    groupId: number
    groupUrl: string
    sender: string
    time: string
    initials: string
    color: string
    name: string;

    constructor(id: number, type: string, message: string, url: string, userId: number, groupId: number, groupUrl: string, sender: string, time: string, initials: string, color: string, name: string) {
        this.id = id;
        this.type = type;
        this.message = message;
        this.url = url;
        this.userId = userId;
        this.groupId = groupId;
        this.groupUrl = groupUrl;
        this.sender = sender;
        this.time = time;
        this.initials = initials;
        this.color = color;
        this.name = name;
    }
}