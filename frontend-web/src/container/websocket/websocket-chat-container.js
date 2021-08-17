import {connect} from 'react-redux'
import {WebSocketChatComponent} from "../../components/websocket/websocket-chat-component";
import {
    fetchGroupMessages, getGroupMessages, markMessageAsSeen,
    sendWsMessage,
    setCurrentActiveGroup
} from "../../actions/websocket-actions";

const mapStateToProps = (state) => {
    const {isWsConnected, currentActiveGroup, chatHistory, wsObject, wsUserGroups} = state.WebSocketReducer;
    return {
        currentActiveGroup,
        chatHistory,
        wsUserGroups,
        wsObject,
        isWsConnected
    };
}

const mapDispatchToProps = dispatch => {
    return {
        fetchMessages: (groupUrl) => dispatch(fetchGroupMessages(groupUrl)),
        getGroupMessages: (groupUrl) => dispatch(getGroupMessages(groupUrl)),
        setCurrentActiveGroup: (bool) => dispatch(setCurrentActiveGroup(bool)),
        sendWsMessage: (message) => dispatch(sendWsMessage(message)),
        markMessageAsSeen: (groupUrl) => dispatch(markMessageAsSeen(groupUrl))
    }
}


const WebSocketChatContainer = connect(mapStateToProps, mapDispatchToProps)(WebSocketChatComponent);

export default WebSocketChatContainer;