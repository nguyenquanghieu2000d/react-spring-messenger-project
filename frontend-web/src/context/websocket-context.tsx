import React, {createContext, useEffect, useState} from 'react'
import {Client} from "@stomp/stompjs";
import {initWebSocket} from "../config/websocket-config";
import {useAuthContext} from "./auth-context";

const WebSocketContext = createContext<Client | null>(null)

export {WebSocketContext}

export const WebSocketProvider: React.FunctionComponent = ({children}) => {
    const [socket, setSocket] = useState<Client | null>(null);
    const {user} = useAuthContext();

    useEffect(() => {
        setSocket(initWebSocket(user?.wsToken || ""))
    }, [])

    return (
        <WebSocketContext.Provider value={socket}>
            {children}
        </WebSocketContext.Provider>
    )
}