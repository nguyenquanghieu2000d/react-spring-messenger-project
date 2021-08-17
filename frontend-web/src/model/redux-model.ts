import {Client} from "@stomp/stompjs";
import {MessageModel} from "./message-model";

export class ReduxModel {

    public client: Client | undefined

    public userToken: string | undefined

    public groupUrl: string | undefined;

    public userId: number | undefined;

    public message: MessageModel | undefined;

    constructor(client?: Client, userToken?: string, groupUrl?: string, userId?: number, message?: MessageModel) {
        this.client = client;
        this.userToken = userToken;
        this.groupUrl = groupUrl;
        this.userId = userId;
        this.message = message;
    }
}