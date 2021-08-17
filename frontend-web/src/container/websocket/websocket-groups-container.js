import {connect} from 'react-redux'
import {WebsocketGroupsComponent} from "../../components/websocket/websocket-groups-component";
import {setCurrentActiveGroup} from "../../actions/websocket-actions";

const mapStateToProps = (state) => {
    const {isWsConnected, wsUserGroups, currentActiveGroup} = state.WebSocketReducer;
    return {
        isWsConnected,
        currentActiveGroup,
        wsUserGroups
    };
}

const mapDispatchToProps = dispatch => {
    return {
        setCurrentActiveGroup: (bool) => dispatch(setCurrentActiveGroup(bool)),
    }
}


const WebSocketGroupsContainer = connect(mapStateToProps, mapDispatchToProps)(WebsocketGroupsComponent);

export default WebSocketGroupsContainer;