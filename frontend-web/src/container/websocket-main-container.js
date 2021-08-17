import {connect} from 'react-redux'
import {WebSocketMainComponent} from "../components/websocket/websocket-main-component";
import {initWsConnection, wsHealthCheckConnected} from "../actions/websocket-actions";

const mapStateToProps = (state) => {
    const {wsUserTokenValue, wsUserGroups, isWsConnected} = state.WebSocketReducer;
    return {
        wsUserTokenValue,
        isWsConnected,
        wsUserGroups
    };
}

const mapDispatchToProps = dispatch => {
    return {
        wsCheckConnected: (bool) => dispatch(wsHealthCheckConnected(bool)),
        setWsObject: (data) => dispatch(initWsConnection(data))
    }
}


const WebSocketMainContainer = connect(mapStateToProps, mapDispatchToProps)(WebSocketMainComponent);

export default WebSocketMainContainer;