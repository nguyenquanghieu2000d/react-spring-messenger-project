import {Client} from "@stomp/stompjs";


const WS_URL = process.env.NODE_ENV === "development" ? "localhost:9090/" : "192.168.1.2:9090/";

export function initWebSocket(userToken: string | undefined): Client {
    return new Client({
        brokerURL: "ws://" + WS_URL + "messenger/websocket?token=" + userToken || "",
        // Uncomment lines to activate WS debug
        // debug: (str: string) => {
        //     console.log(str);
        // },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });
}