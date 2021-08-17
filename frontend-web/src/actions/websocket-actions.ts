import {
    CURRENT_ACTIVE_GROUP,
    FETCH_GROUP_MESSAGES, GET_GROUP_MESSAGES,
    INIT_WS_CONNECTION, MARK_MESSAGE_AS_SEEN, SEND_GROUP_MESSAGE,
    SET_WS_GROUPS, UNSUBSCRIBE_ALL, WS_CHECK_CONNECTED
} from "../utils/redux-constants";
import {Client} from "@stomp/stompjs";
import {GroupModel} from "../model/group-model";
import {ReduxModel} from "../model/redux-model";

export const initWsConnection = (client: Client) => ({
    type: INIT_WS_CONNECTION,
    payload: client
})

export const wsHealthCheckConnected = (isWsConnected: boolean) => ({
    type: WS_CHECK_CONNECTED,
    payload: isWsConnected
})

export const setWsUserGroups = (groupsArray: GroupModel[]) => ({
    type: SET_WS_GROUPS,
    payload: groupsArray
})

export const setCurrentActiveGroup = (groupUrl: string) => ({
    type: CURRENT_ACTIVE_GROUP,
    payload: groupUrl
})

export const getGroupMessages = (groupUrl: string) => ({
    type: GET_GROUP_MESSAGES,
    payload: groupUrl
})


export const fetchGroupMessages = (groupUrl: string) => ({
    type: FETCH_GROUP_MESSAGES,
    payload: groupUrl
})

export const sendWsMessage = (model: ReduxModel) => ({
    type: SEND_GROUP_MESSAGE,
    payload: model
})

export const unsubscribeAll = () => ({
    type: UNSUBSCRIBE_ALL
})

export const markMessageAsSeen = (groupUrl: string) => ({
    type: MARK_MESSAGE_AS_SEEN,
    payload: groupUrl
})
