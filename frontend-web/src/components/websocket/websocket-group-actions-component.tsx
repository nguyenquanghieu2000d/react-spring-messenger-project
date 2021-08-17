import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import {
    generateClassName,
    generateIconColorMode,
    generateInputTextColorMode
} from "../../design/style/enable-dark-mode";
import ListItemText from "@material-ui/core/ListItemText";
import GroupIcon from "@material-ui/icons/Group";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";
import SecurityIcon from "@material-ui/icons/Security";
import PersonIcon from "@material-ui/icons/Person";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Tooltip from "@material-ui/core/Tooltip";
import React, {useEffect, useState} from "react";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import AuthService from "../../service/auth-service";
import {AllUsersDialog} from "../../design/dialog/all-users-dialog";
import {useThemeContext} from "../../context/theme-context";
import {useAuthContext} from "../../context/auth-context";
import {GroupActionEnum} from "./group-action-enum";
import {AxiosResponse} from "axios";
import GroupUserModel from "../../model/group-user-model";
import {useAlertContext} from "../../context/alert-context";
import {FeedbackModel} from "../../model/feedback-model";
import UUIDv4 from "../../utils/uuid-generator";

interface WebsocketGroupActionsComponentType {
    currentActiveGroup: string
}

export const WebSocketGroupActionComponent: React.FunctionComponent<WebsocketGroupActionsComponentType> = ({currentActiveGroup}) => {
    const groupUrl = window.location.pathname.split("/").slice(-1)[0];
    const [paramsOpen, setParamsOpen] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
    const [usersInConversation, setUsersInConversation] = useState<GroupUserModel[]>([]);
    const [allUsers, setAllUsers] = useState<GroupUserModel[]>([]);
    const [isCurrentUserAdmin, setCurrentUserIsAdmin] = useState(false);
    const [toolTipAction, setToolTipAction] = useState(false);
    const [openTooltipId, setToolTipId] = useState<number | null>(null);
    const {theme} = useThemeContext();
    const {alerts, setAlerts} = useAlertContext();
    const {user} = useAuthContext();

    useEffect(() => {
        clearData()
        return () => {
            clearData()
        }
    }, [currentActiveGroup])


    function handleTooltipAction(event: any, action: string) {
        event.preventDefault();
        if (action === GroupActionEnum.OPEN) {
            setToolTipAction(true)
        }
        if (action === GroupActionEnum.CLOSE) {
            setToolTipAction(false)
            setToolTipId(null)
        }
    }

    function clearData() {
        setToolTipAction(false)
        setToolTipId(null)
        setCurrentUserIsAdmin(false)
        setUsersInConversation([])
        handlePopupState(false)
        setParamsOpen(false)
    }

    function handleDisplayUserAction(event: any, id: number) {
        event.preventDefault();
        setToolTipId(id)
    }

    function closeDisplayUserAction(event: any) {
        event.preventDefault();
        setToolTipAction(false)
        setToolTipId(null)
    }

    function handleClick(event: any, action: string) {
        event.preventDefault();
        switch (action) {
            case GroupActionEnum.PARAM:
                usersInConversation.length === 0 && new AuthService().fetchAllUsersInConversation(groupUrl).then((r: AxiosResponse<GroupUserModel[]>) => {
                    r.data.forEach((val) => {
                        console.log(val)
                        if (val.userId === user?.id && val.admin) {
                            setCurrentUserIsAdmin(true);
                        }
                    })
                    setUsersInConversation(r.data)
                })
                setParamsOpen(!paramsOpen);
                break
            default:
                throw new Error("Error, please refresh page")
        }
    }

    function handlePopupState(isOpen: boolean) {
        setPopupOpen(isOpen)
    }

    function handleAddUserAction(action: string) {
        switch (action) {
            case GroupActionEnum.OPEN:
                handlePopupState(true)
                if (allUsers.length === 0) {
                    new AuthService().fetchAllUsersWithoutAlreadyInGroup(groupUrl).then((r: AxiosResponse<GroupUserModel[]>) => {
                        setAllUsers(r.data)
                    });
                }
                break;
            case GroupActionEnum.CLOSE:
                handlePopupState(false);
                break;
            default:
                throw new Error("Cannot handle AddUserAction");
        }
    }

    function leaveGroup(event: any) {

    }

    function removeUserFromAdminListInConversation(event: any, userId: string | number) {

    }

    function grantUserAdminInConversation(event: any, userId: string | number) {

    }

    function addUserInConversation(userId: string | number) {
        new AuthService().addUserToGroup(userId, groupUrl).then((res) => {
            setAlerts([...alerts, new FeedbackModel(UUIDv4(), res.data, "success", true)])
        }).catch((err) => {
            setAlerts([...alerts, new FeedbackModel(UUIDv4(), "Cannot add user to group : " + err.toString(), "error", true)])
        }).finally(() => {
            setPopupOpen(false);
        })
    }

    function removeUserFromConversation(event: any, userId: string | number) {

    }


    return (
        <div>
            <div className={"sidebar"}>
                <List
                    component="nav">
                    <ListItem button onClick={() => handleAddUserAction(GroupActionEnum.OPEN)}>
                        <ListItemIcon>
                            <GroupAddIcon style={{color: generateIconColorMode(theme)}}/>
                        </ListItemIcon>
                        <ListItemText primary="Add user to group"/>
                    </ListItem>
                    <ListItem button onClick={(event) => handleClick(event, GroupActionEnum.PARAM)}>
                        <ListItemIcon>
                            <GroupIcon style={{color: generateIconColorMode(theme)}}/>
                        </ListItemIcon>
                        <ListItemText primary="Members"/>
                        {paramsOpen ? <ExpandLess/> : <ExpandMore/>}
                    </ListItem>
                    <Collapse in={paramsOpen}>
                        <List component="div" disablePadding>
                            {paramsOpen && usersInConversation.map((value, index) => (
                                <ListItem key={index}
                                          onMouseEnter={event => handleDisplayUserAction(event, index)}
                                          onMouseLeave={event => closeDisplayUserAction(event)}>
                                    <ListItemIcon>
                                        {
                                            value.admin ? <SecurityIcon
                                                    style={{color: generateIconColorMode(theme)}}/> :
                                                <PersonIcon
                                                    style={{color: generateIconColorMode(theme)}}/>
                                        }
                                    </ListItemIcon>
                                    <ListItemText primary={value.firstName + " " + value.lastName}
                                                  secondary={
                                                      <React.Fragment>
                                                          <span className={generateClassName(theme)}>
                                                          {

                                                              value.admin ?
                                                                  "Administrator" : ""
                                                          }
                                                              </span>
                                                      </React.Fragment>
                                                  }/>
                                    <ListItemSecondaryAction
                                        onMouseEnter={event => handleDisplayUserAction(event, index)}
                                        onMouseLeave={event => closeDisplayUserAction(event)}
                                    >
                                        {openTooltipId === index ?
                                            <Tooltip
                                                interactive={true}
                                                PopperProps={{
                                                    disablePortal: false,
                                                }}
                                                onClose={event => handleTooltipAction(event, GroupActionEnum.CLOSE)}
                                                open={toolTipAction}
                                                disableFocusListener
                                                disableHoverListener
                                                disableTouchListener
                                                title={
                                                    <React.Fragment>
                                                        <div>
                                                            {
                                                                isCurrentUserAdmin && value.admin &&
                                                                <MenuItem
                                                                    onClick={event => removeUserFromAdminListInConversation(event, value.userId)}
                                                                    dense={true}>Remove from
                                                                    administrator
                                                                </MenuItem>
                                                            }
                                                            {
                                                                isCurrentUserAdmin && !value.admin &&
                                                                <MenuItem
                                                                    onClick={event => grantUserAdminInConversation(event, value.userId)}
                                                                    dense={true}>Grant
                                                                    administrator</MenuItem>
                                                            }
                                                            {
                                                                !(user?.id === value.userId) &&
                                                                <MenuItem
                                                                    onClick={event => removeUserFromConversation(event, value.userId)}
                                                                    dense={true}>Remove from group</MenuItem>
                                                            }
                                                            {
                                                                user?.id === value.userId &&
                                                                <MenuItem
                                                                    onClick={event => leaveGroup(event)}
                                                                    dense={true}>Leave group</MenuItem>
                                                            }
                                                        </div>
                                                    </React.Fragment>
                                                }>
                                                <IconButton
                                                    onClick={event => handleTooltipAction(event, GroupActionEnum.OPEN)}
                                                    style={{color: generateIconColorMode(theme)}}>
                                                    <MoreHorizIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            :
                                            <IconButton/>
                                        }
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>
                </List>
            </div>
            <AllUsersDialog usersList={allUsers} open={popupOpen} setOpen={handlePopupState}
                            dialogTitle={"Add user to conversation"} action={addUserInConversation}/>
        </div>
    )
}