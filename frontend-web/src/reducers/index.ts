import {combineReducers} from "redux";
import WebSocketReducer from "./websocket-reducer";
import WebRTCReducer from "./webRTC-reducer";

const rootReducer = combineReducers({
    WebSocketReducer,
    WebRTCReducer
});

export default rootReducer;