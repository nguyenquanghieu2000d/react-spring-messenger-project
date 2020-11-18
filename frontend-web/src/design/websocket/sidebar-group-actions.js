import React, {Component} from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AuthService from "../../service/auth-service";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListSubheader from "@material-ui/core/ListSubheader";
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import GroupIcon from '@material-ui/icons/Group';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from "@material-ui/core/Collapse";
import SecurityIcon from '@material-ui/icons/Security';
import PersonIcon from '@material-ui/icons/Person';
import {generateIconColorMode} from "../style/enable-dark-mode";
import {withRouter} from "react-router-dom";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Toaster from "../utils/toaster";

class SidebarGroupActions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toasterOpened: false,
            anchorEl: null,
            popupOpen: false,
            toolTipAction: false,
            paramsOpen: false,
            usersInConversationList: [],
            usersList: null
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleTooltipAction = this.handleTooltipAction.bind(this);
        this.closeUserMenu = this.closeUserMenu.bind(this);
        this.handleDisplayUserAction = this.handleDisplayUserAction.bind(this);
    }


    handleAddUserAction(event, action) {
        event.preventDefault();
        switch (action) {
            case "open":
                AuthService.fetchAllUsers().then(r => {
                    this.setState({usersList: r.data})
                });
                this.setState({popupOpen: true});
                break;
            case "close":
                this.setState({popupOpen: false});
                break;
            default:
                throw new Error("Cannot handle AddUserAction");
        }

    }

    addUser(event, userId) {
        event.preventDefault();
        AuthService.addUserToGroup(userId, this.props.groupUrl).then(r => {
            console.log(r.status);
            this.setState({popupOpen: false})
            AuthService.fetchAllUsersInConversation(this.props.groupUrl).then(r => {
                this.setState({usersInConversationList: r.data})
            });
        });
    }

    handleTooltipAction(event, action) {
        event.preventDefault();
        if (action === "open") {
            this.setState({toolTipAction: true, anchorEl: event.currentTarget})
        } else {
            this.setState({toolTipAction: false})
        }
    }

    handleClick(event, target) {
        event.preventDefault();
        switch (target) {
            case "param":
                const groupUrl = this.props.location.pathname.split("/").slice(-1)[0];
                this.state.usersInConversationList.length === 0 && AuthService.fetchAllUsersInConversation(groupUrl).then(r => {
                    console.log(r.data)
                    this.setState({usersInConversationList: r.data})
                })
                this.setState(prevState => {
                    return {
                        paramsOpen: !prevState.paramsOpen
                    }
                });
                break
            default:
                throw new Error("Error, please refresh page")
        }
    }

    removeUserFromConversation(event, userId) {
        event.preventDefault();
        AuthService.removeUserFromConversation(userId, this.props.groupUrl).then(r => {
            if (r.status === 200) {
                let userToRemoveIndex = this.state.usersInConversationList.findIndex(elt => elt.id === userId)
                let usersInGroupArray = [...this.state.usersInConversationList];
                usersInGroupArray.splice(userToRemoveIndex, 1);
                this.setState({usersInConversationList: usersInGroupArray, toasterOpened: true});
            }
            this.closeUserMenu();
        }).catch(err =>
            this.closeUserMenu()
        );
    }

    grantUserAdminInConversation(event, userId) {
        event.preventDefault();
        AuthService.grantUserAdminInConversation(userId, this.props.groupUrl).then(r => {
            if (r.status === 200) {
                console.log(r);
                const groupUrl = this.props.location.pathname.split("/").slice(-1)[0];
                AuthService.fetchAllUsersInConversation(groupUrl).then(r => {
                    console.log(r);
                })
            }
            this.closeUserMenu();
        }).catch(err => this.closeUserMenu());
    }

    closeUserMenu() {
        this.setState({paramsOpen: false})
    }

    handleDisplayUserAction(event, action) {
        event.preventDefault();
        switch (action) {
            case "open":
                this.setState({usersListAction: true});
                break;
            case "close":
                this.setState({usersListAction: false});
                break;
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.activate !== this.props.activate) {
            this.setState({
                popupOpen: false,
                paramsOpen: false,
                anchorEl: null,
                usersInConversationList: [],
                toolTipAction: false,
                usersList: null
            })
        }
    }

    render() {
        return (
            <div>
                <div className={"sidebar"}>
                    <List
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                        subheader={
                            <ListSubheader component="div">
                                <span className={"clrcstm"}>Parameters</span>
                            </ListSubheader>
                        }>
                        <ListItem button onClick={(event) => this.handleAddUserAction(event, "open")}>
                            <ListItemIcon>
                                <GroupAddIcon style={{color: generateIconColorMode(this.props.isDarkModeEnable)}}/>
                            </ListItemIcon>
                            <ListItemText primary="Add user to group"/>
                        </ListItem>
                        <ListItem button onClick={(event) => this.handleClick(event, "param")}>
                            <ListItemIcon>
                                <GroupIcon style={{color: generateIconColorMode(this.props.isDarkModeEnable)}}/>
                            </ListItemIcon>
                            <ListItemText primary="Members"/>
                            {this.state.paramsOpen ? <ExpandLess/> : <ExpandMore/>}
                        </ListItem>
                        <Collapse in={this.state.paramsOpen} timeout="auto">
                            <List component="div" disablePadding>
                                {this.state.paramsOpen && this.state.usersInConversationList.map((value, index) => (
                                    <ListItem key={index}
                                              onMouseEnter={event => this.handleDisplayUserAction(event, "open")}
                                              onMouseLeave={event => this.handleDisplayUserAction(event, "close")}
                                              button>
                                        <ListItemIcon>
                                            {
                                                value.admin ? <SecurityIcon
                                                        style={{color: generateIconColorMode(this.props.isDarkModeEnable)}}/> :
                                                    <PersonIcon
                                                        style={{color: generateIconColorMode(this.props.isDarkModeEnable)}}/>
                                            }
                                        </ListItemIcon>
                                        <ListItemText primary={value.firstName + " " + value.lastName}/>
                                        <ListItemSecondaryAction
                                            onMouseEnter={event => this.handleDisplayUserAction(event, "open")}
                                            onMouseLeave={event => this.handleDisplayUserAction(event, "close")}>
                                            {!this.state.usersListAction && value.admin ? "Administrator" : ""}
                                            {this.state.usersListAction &&
                                            <div>
                                                {
                                                    this.props.userId !== value.userId ?
                                                        <IconButton disabled={this.props.userId === value.userId}
                                                                    onClick={event => this.handleTooltipAction(event, "open")}>
                                                            <MoreHorizIcon
                                                                style={{color: generateIconColorMode(this.props.isDarkModeEnable)}}/>
                                                        </IconButton> : "You"
                                                }
                                                <Menu
                                                    id="fade-menu"
                                                    anchorEl={this.state.anchorEl}
                                                    keepMounted
                                                    open={this.state.toolTipAction}
                                                    onClose={(event => this.handleTooltipAction(event, "close"))}
                                                >
                                                    <MenuItem
                                                        onClick={event => this.grantUserAdminInConversation(event, value.userId)}
                                                        dense={true}>Grant administrator</MenuItem>
                                                    <MenuItem
                                                        onClick={event => this.removeUserFromConversation(event, value.userId)}
                                                        dense={true}>Remove from group</MenuItem>
                                                </Menu>
                                            </div>
                                            }
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                    </List>
                </div>
                <Dialog onClose={(event) => this.handleAddUserAction(event, "close")}
                        aria-labelledby="simple-dialog-title"
                        fullWidth
                        maxWidth={"md"}
                        open={this.state.popupOpen}>
                    <DialogTitle id="simple-dialog-title">Add people to conversation</DialogTitle>
                    <List>
                        {
                            this.state.popupOpen && this.state.usersList && this.state.usersList.map(data => (
                                <ListItem button key={data.id} disabled={data.id === this.props.userId}
                                          onClick={(event => this.addUser(event, data.id))}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <AccountCircleIcon
                                                style={{color: generateIconColorMode(this.props.isDarkModeEnable)}}/>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={
                                        <React.Fragment>
                                                <span style={{display: "flex", justifyContent: "space-around"}}>
                                                        {data.firstName + " " + data.lastName}
                                            {
                                                data.id === this.props.userId && "(You)"
                                            }
                                                    </span>
                                        </React.Fragment>
                                    }
                                    />
                                </ListItem>
                            ))
                        }
                    </List>
                </Dialog>
                <Toaster toasterOpened={this.state.toasterOpened} text={"User successfully deleted from group"}/>
            </div>
        )
    }
}

export default withRouter(SidebarGroupActions);