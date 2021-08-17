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
    MARK_MESSAGE_AS_SEEN, GET_GROUP_MESSAGES
} from "../utils/redux-constants";
import {wsHealthCheckConnected} from "../actions/websocket-actions";
import {handleRTCActions, handleRTCSubscribeEvents} from "./webRTC-middleware";

let userQueueReplySubscribe;
let topicNotificationSubscribe;
let topicCallReplySubscribe;
let appGroupGetSubscribe;
let topicGroupSubscribe;

function initWsAndSubscribe(wsClient, store, reduxModel) {
    const groupUrl = reduxModel.groupUrl;
    const wsUserTokenValue = reduxModel.userToken;
    const userId = reduxModel.userId;
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
            console.log("RECEIVING NOTIFICATION")
            console.log(JSON.parse(res.body))
            updateGroupsWithLastMessageSent(store, JSON.parse(res.body), userId);
        })

        wsClient.subscribe("/topic/call/reply/" + groupUrl, (res) => {
            const data = JSON.parse(res.body);
            handleRTCSubscribeEvents(data, store);
        });

        topicCallReplySubscribe = wsClient.publish({destination: "/app/message", body: wsUserTokenValue});
        // console.log("On récupère les messages du groupe actif")
        // store.dispatch({
        //     type: FETCH_GROUP_MESSAGES,
        //     payload: localStorage.getItem("_cAG")
        // })
    }

    wsClient.onWebSocketClose = () => {
        console.log("ERROR DURING HANDSHAKE WITH SERVER")
        store.dispatch(wsHealthCheckConnected(false))
    }
    wsClient.activate();
}

const WsClientMiddleWare = () => {
    let wsClient = null;

    return (store) => (next) => (action) => {
        switch (action.type) {
            case INIT_WS_CONNECTION:
                if (action.payload === null) {
                    return next(action);
                }
                wsClient = action.payload.client;
                console.log(action.payload)
                initWsAndSubscribe(wsClient, store, action.payload);
                break;
            case GET_GROUP_MESSAGES:
                if (wsClient !== null) {
                    appGroupGetSubscribe = wsClient.subscribe("/app/groups/get/" + action.payload, (res) => {
                        const data = JSON.parse(res.body);
                        console.log(data)
                        store.dispatch({type: SET_CHAT_HISTORY, payload: data})
                    });
                    topicGroupSubscribe = wsClient.subscribe("/topic/" + action.payload, (res) => {
                        const data = JSON.parse(res.body);
                        console.log(data)
                        store.dispatch({type: ADD_CHAT_HISTORY, payload: data})
                    });
                }
                break;
            case FETCH_GROUP_MESSAGES:
                if (wsClient !== null) {
                    // topicGroupSubscribe = wsClient.subscribe("/topic/" + action.payload.groupUrl || "", (res) => {
                    //     const data = JSON.parse(res.body);
                    //     console.log(data)
                    //     store.dispatch({type: ADD_CHAT_HISTORY, payload: data})
                    // });
                }
                break;
            case SEND_GROUP_MESSAGE:
                if (wsClient !== null) {
                    wsClient.publish({
                        destination: "/app/message/text/" + action.payload.userId + "/group/" + action.payload.groupUrl,
                        body: JSON.stringify(action.payload.message)
                    });
                    console.log("TODO UPDATE MESSAGE")
                }
                break;
            case MARK_MESSAGE_AS_SEEN:
                markMessageAsSeen(store, action.payload.groupUrl || "")
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
 * @param userId
 */
function updateGroupsWithLastMessageSent(store, value, userId) {
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
    item.lastMessageSeen = value.fromUserId !== userId;
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
    groupsArray[groupToUpdateIndex].lastMessageSeen = false;
    store.dispatch({type: SET_WS_GROUPS, payload: groupsArray})
}

export default WsClientMiddleWare();