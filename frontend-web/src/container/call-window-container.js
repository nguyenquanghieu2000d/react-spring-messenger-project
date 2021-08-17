import {connect} from 'react-redux'
import {CallWindowComponent} from "../components/websocket/call-window-component";
import {initWsConnection} from "../actions/websocket-actions";
import {createAnswer, createOffer, sendToServer} from "../actions/web-rtc-actions";

const mapStateToProps = (state) => {
    const {wsUserTokenValue, isWsConnected} = state.WebSocketReducer;
    const {webRtcOffer, webRtcAnswer, webRtcCandidate} = state.WebRTCReducer;
    return {
        wsUserTokenValue,
        isWsConnected,
        webRtcAnswer,
        webRtcCandidate,
        webRtcOffer
    };
}

const mapDispatchToProps = dispatch => {
    return {
        setWsObject: (data) => dispatch(initWsConnection(data)),
        createOffer: (data) => dispatch(createOffer(data)),
        createAnswer: (data) => dispatch(createAnswer(data)),
        sendToServer: (data) => dispatch(sendToServer(data))
    }
}

const CallWindowContainer = connect(mapStateToProps, mapDispatchToProps)(CallWindowComponent);

export default CallWindowContainer;