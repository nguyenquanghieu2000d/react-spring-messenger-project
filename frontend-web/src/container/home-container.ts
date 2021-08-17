import {connect} from 'react-redux'
import {withRouter} from "react-router-dom";
import {HomeComponent} from "../design/home";

const HomeContainer = connect(null, null)(HomeComponent);

export default withRouter(HomeContainer);