import {connect} from 'react-redux'
import {WebsocketGroupsComponent} from "../components/websocket/websocket-groups-component";

const mapStateToProps = (state: any) => {
    const {isWsConnected, wsUserGroups} = state.WebSocketReducer;
    return {
        isWsConnected,
        wsUserGroups
    };
}


const WebSocketGroupsContainer = connect(mapStateToProps, null)(WebsocketGroupsComponent);

export default WebSocketGroupsContainer;