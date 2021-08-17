import React, {useEffect} from "react";
import {generateColorMode} from "../../design/style/enable-dark-mode";
import WebSocketGroupsContainer from "../../container/websocket/websocket-groups-container";
import WebSocketChatContainer from "../../container/websocket/websocket-chat-container";
import "./websocketStyle.css"
import {initWebSocket} from "../../config/websocket-config";
import WebSocketGroupsActionContainer from "../../container/websocket/websocket-group-actions-container";
import {useThemeContext} from "../../context/theme-context";
import {useAuthContext} from "../../context/auth-context";
import {ReduxModel} from "../../model/redux-model";

interface WebsocketMainComponentType {
    setWsObject: (model: ReduxModel | null) => {}
    wsCheckConnected: (isConnected: boolean) => {}
    initCallWebRTC: () => {}
    unsubscribeAll: () => {}
}

export const WebSocketMainComponent: React.FunctionComponent<WebsocketMainComponentType> = ({
                                                                                                setWsObject,
                                                                                                wsCheckConnected,
                                                                                                initCallWebRTC,
                                                                                                unsubscribeAll,
                                                                                            }) => {
    const {theme} = useThemeContext();
    const {user} = useAuthContext();

    useEffect(() => {
        if (user && user.wsToken !== null) {
            initWs()
        }
        return () => {
            setWsObject(null);
            wsCheckConnected(false);
            unsubscribeAll()
            console.log("Disconnected")
        }
    }, [user?.wsToken])

    async function initWs() {
        const wsClient = await initWebSocket(user?.wsToken);
        const toSend = new ReduxModel(wsClient, user?.wsToken);
        setWsObject(toSend);
    }

    return (
        <div className={generateColorMode(theme)}
             style={{height: "calc(100% - 64px)", display: "flex", justifyContent: "space-between"}}>
            <WebSocketGroupsContainer/>
            <WebSocketChatContainer/>
            <WebSocketGroupsActionContainer/>
        </div>
    )
}
