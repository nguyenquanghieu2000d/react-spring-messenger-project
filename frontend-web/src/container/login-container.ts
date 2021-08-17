import {connect} from 'react-redux'
import {withRouter} from "react-router-dom";
import {LoginComponent} from "../components/login-component";


const LoginContainer = connect(null, null)(LoginComponent);

export default withRouter(LoginContainer);