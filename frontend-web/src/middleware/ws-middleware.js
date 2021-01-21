import {
    FETCH_GROUP_MESSAGES,
    HANDLE_RTC_OFFER,
    HANDLE_RTC_ACTIONS,
    INIT_WS_CONNECTION,
    SET_CHAT_HISTORY,
    SET_WS_GROUPS,
    HANDLE_RTC_ANSWER,
    SEND_TO_SERVER,
    SEND_GROUP_MESSAGE,
    ADD_CHAT_HISTORY,
    UNSUBSCRIBE_ALL,
    MARK_MESSAGE_AS_SEEN
} from "../utils/redux-constants";
import {wsHealthCheckConnected} from "../actions/webSocketActions";
import {handleRTCActions, handleRTCSubscribeEvents} from "./webRTC-middleware";

let userQueueReplySubscribe;
let topicNotificationSubscribe;
let topicCallReplySubscribe;
let appGroupGetSubscribe;
let topicGroupSubscribe;

function initWsAndSubscribe(wsClient, store, wsUserTokenValue) {
    const groupUrl = localStorage.getItem("_cAG");
    const userId = store.getState().AuthReducer.userId;

    wsClient.onConnect = () => {
        store.dispatch(store.dispatch(wsHealthCheckConnected(true)))

        userQueueReplySubscribe = wsClient.subscribe("/user/queue/reply", (res) => {
            const data = JSON.parse(res.body)
            // retrieveUserData(res);
            store.dispatch({
                type: SET_WS_GROUPS,
                payload: data
            });
        })

        topicNotificationSubscribe = wsClient.subscribe("/topic/notification/" + userId, (res) => {
            console.log("RECEIVEING NOTIFICATION")
            // updateLastMessageInGroups(store, JSON.parse(res.body), groups);
            console.log(groupUrl)
            console.log(JSON.parse(res.body))
            updateGroupsWithLastMessageSent(store, JSON.parse(res.body));
        })

        wsClient.subscribe("/topic/call/reply/" + groupUrl, (res) => {
            const data = JSON.parse(res.body);
            handleRTCSubscribeEvents(data, store);
        });

        topicCallReplySubscribe = wsClient.publish({destination: "/app/message", body: wsUserTokenValue});
        console.log("On récupère les messages du groupe actif")
        store.dispatch({
            type: FETCH_GROUP_MESSAGES,
            payload: localStorage.getItem("_cAG")
        })
    }

    wsClient.onWebSocketClose = () => {
        console.log("ERROR DURING HANDSHAKE WITH SERVER")
        store.dispatch(wsHealthCheckConnected(false))
    }
    wsClient.activate();
}

const WsClientMiddleWare = () => {
    let wsClient = null;

    return store => next => action => {
        const groupUrl = localStorage.getItem("_cAG")
        const userId = store.getState().AuthReducer.userId;
        switch (action.type) {
            case INIT_WS_CONNECTION:
                // console.log("Starting WS stomp")
                if (action.payload === null) {
                    return next(action);
                }
                wsClient = action.payload.stomp;
                const wsUserTokenValue = action.payload.token;
                initWsAndSubscribe(wsClient, store, wsUserTokenValue);
                break;
            case FETCH_GROUP_MESSAGES:
                // console.log(groupUrl)

                if (wsClient !== null) {
                    appGroupGetSubscribe = wsClient.subscribe("/app/groups/get/" + groupUrl, (res) => {
                        const data = JSON.parse(res.body);
                        store.dispatch({type: SET_CHAT_HISTORY, payload: data})
                    });

                    topicGroupSubscribe = wsClient.subscribe("/topic/" + groupUrl, (res) => {
                        const data = JSON.parse(res.body);
                        store.dispatch({type: ADD_CHAT_HISTORY, payload: data})
                    });
                }
                break;
            case SEND_GROUP_MESSAGE:
                if (wsClient !== null) {
                    wsClient.publish({
                        destination: "/app/message/text/" + userId + "/group/" + groupUrl,
                        body: JSON.stringify(action.payload)
                    });
                }
                break;
            case MARK_MESSAGE_AS_SEEN:
                markMessageAsSeen(store, groupUrl)
                break;
            case UNSUBSCRIBE_ALL:
                if (wsClient !== null) {
                    if (userQueueReplySubscribe !== undefined) {
                        wsClient.unsubscribe(userQueueReplySubscribe.id);
                    }
                    if (topicNotificationSubscribe !== undefined) {
                        wsClient.unsubscribe(topicNotificationSubscribe.id);
                    }
                    if (topicCallReplySubscribe !== undefined) {
                        wsClient.unsubscribe(topicCallReplySubscribe.id);
                    }
                    if (appGroupGetSubscribe !== undefined) {
                        wsClient.unsubscribe(appGroupGetSubscribe.id);
                    }
                    if (topicGroupSubscribe !== undefined) {
                        wsClient.unsubscribe(topicGroupSubscribe.id);
                    }
                    wsClient.deactivate().then(r => {
                        console.log(r)
                        wsClient = null;
                    }).catch(err => {
                        console.log(err)
                    });
                }
                break;
            case HANDLE_RTC_ACTIONS:
                handleRTCActions(wsClient, store, action.payload);
                break;
            case HANDLE_RTC_OFFER:
                console.log("Create offer ...")
                handleRTCActions(wsClient, store, action.payload);
                break;
            case HANDLE_RTC_ANSWER:
                console.log("Create answer ...")
                handleRTCActions(wsClient, store, action.payload);
                break;
            case SEND_TO_SERVER:
                handleRTCActions(wsClient, store, action.payload);
                break;
            default:
                return next(action);
        }
    };
};


/**
 * Update groups sidebar with new messages
 *
 * @param store
 * @param value
 */
function updateGroupsWithLastMessageSent(store, value) {
    const groupIdToUpdate = value.groupId;
    const groups = store.getState().WebSocketReducer.wsUserGroups;

    let groupToPlaceInFirstPosition = groups.findIndex(elt => elt.id === groupIdToUpdate);
    if (groupToPlaceInFirstPosition === -1) {
        return
    }
    let groupsArray = [...groups];
    let item = {...groupsArray[groupToPlaceInFirstPosition]};
    item.lastMessage = value.message;
    item.lastMessageDate = value.lastMessageDate;
    item.lastMessageSeen = true;
    groupsArray.splice(groupToPlaceInFirstPosition, 1);
    groupsArray.unshift(item);
    store.dispatch({type: SET_WS_GROUPS, payload: groupsArray})
}

function markMessageAsSeen(store, groupUrl) {
    const groups = store.getState().WebSocketReducer.wsUserGroups;
    const groupToUpdateIndex = groups.findIndex(elt => elt.url === groupUrl);
    if (groupToUpdateIndex === -1) {
        return;
    }
    if (groups[groupToUpdateIndex].lastMessageSeen === false) {
        return;
    }
    let groupsArray = [...groups];
    console.log(groupsArray)
    groupsArray[groupToUpdateIndex].lastMessageSeen = false;
    console.log(groupsArray)
    store.dispatch({type: SET_WS_GROUPS, payload: groupsArray})
}

export default WsClientMiddleWare();