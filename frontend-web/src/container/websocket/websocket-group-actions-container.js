import {connect} from 'react-redux'
import {setCurrentActiveGroup} from "../../actions/websocket-actions";
import {WebSocketGroupActionComponent} from "../../components/websocket/websocket-group-actions-component";

const mapStateToProps = (state) => {
    const {currentActiveGroup} = state.WebSocketReducer;
    return {
        currentActiveGroup
    };
}

const mapDispatchToProps = dispatch => {
    return {
        setCurrentActiveGroup: (bool) => dispatch(setCurrentActiveGroup(bool)),
    }
}


const WebSocketGroupsActionContainer = connect(mapStateToProps, mapDispatchToProps)(WebSocketGroupActionComponent);

export default WebSocketGroupsActionContainer;