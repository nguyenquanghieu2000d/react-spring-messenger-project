import React, {Component} from 'react';
import './App.css';
import {createBrowserHistory} from 'history';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import {RegisterFormComponent} from "./design/register/register-user";
import HeaderContainer from "./container/header-container";
import HomeContainer from "./container/home-container";
import LoginContainer from "./container/login-container";
import CreateGroupContainer from "./container/create-group-container";
import WebSocketMainContainer from "./container/websocket/websocket-main-container";
import {WebsocketContextMain} from "./context/websocket-context-main";
import {AlertComponent} from "./design/utils/alert-component";


const history = createBrowserHistory();

class App extends Component {
    constructor(props: any) {
        super(props);
        this.state = {
            isDarkModeEnabled: false,
            authenticated: null,
            wsToken: null,
            openToaster: false
        };
        this.toggleDarkMode = this.toggleDarkMode.bind(this);
        this.setUserAuthenticated = this.setUserAuthenticated.bind(this);
        this.setWsToken = this.setWsToken.bind(this);
    }

    toggleDarkMode = (value: string) => {
        this.setState({isDarkModeEnabled: value})
    }

    setUserAuthenticated(value: boolean) {
        this.setState({authenticated: value})
    }

    setWsToken(value: string) {
        this.setState({wsToken: value})
    }

    render() {
        return (
            <Router>
                <HeaderContainer/>
                <Switch>
                    <Route exact path="/" render={(props: any) =>
                        <HomeContainer
                            {...props}
                        />}
                    />
                    <Route exact path="/create" render={(props: any) =>
                        <CreateGroupContainer
                            {...props}
                        />}
                    />
                    <Route exact path="/t/messages" render={(props: any) =>
                        <WebSocketMainContainer
                            {...props}
                        />}
                    />

                    <Route exact path="/t/messages/:groupId" render={(props: any) =>
                        <WebsocketContextMain
                            {...props}
                        />}
                    />
                    <Route exact path="/register" render={(props: any) =>
                        <RegisterFormComponent
                            {...props}
                            history={history}
                            // isDarkModeEnable={this.state.isDarkModeEnabled}
                        />}
                    />
                    <Route exact path="/login" render={(props: any) =>
                        <LoginContainer
                            {...props}
                            history={history}
                        />}
                    />
                    {/*<Route exact path="/call/:callId" render={(props) =>*/}
                    {/*    <CallWindowContainerTRASH*/}
                    {/*        {...props}*/}
                    {/*    />}*/}
                    {/*/>*/}
                </Switch>
                <AlertComponent/>
            </Router>
        )
    }
}

export default App;
