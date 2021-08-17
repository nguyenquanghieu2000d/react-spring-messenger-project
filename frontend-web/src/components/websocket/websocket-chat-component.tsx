import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import Button from "@material-ui/core/Button";
import ImageIcon from "@material-ui/icons/Image";
import CustomTextField from "../../design/partials/custom-material-textfield";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import React, {useEffect} from "react";
import ImagePreview from "../../design/partials/image-preview";
import AuthService from "../../service/auth-service";
import {useThemeContext} from "../../context/theme-context";
import {useAuthContext} from "../../context/auth-context";
import {MessageModel} from "../../model/message-model";
import {ReduxModel} from "../../model/redux-model";
import {GroupModel} from "../../model/group-model";
import {AxiosError} from "axios";
import {FullMessageModel} from "../../model/full-message-model";

interface WebsocketChatComponentType {
    getGroupMessages: (groupUrl: string) => {},
    currentActiveGroup: () => {},
    sendWsMessage: (model: ReduxModel) => {},
    markMessageAsSeen: (message: string) => {},
    fetchMessages: () => {},
    chatHistory: FullMessageModel[],
    wsUserGroups: GroupModel[]
}

export const WebSocketChatComponent: React.FunctionComponent<WebsocketChatComponentType> = ({
                                                                                                getGroupMessages,
                                                                                                currentActiveGroup,
                                                                                                sendWsMessage,
                                                                                                markMessageAsSeen,
                                                                                                fetchMessages,
                                                                                                chatHistory,
                                                                                                wsUserGroups
                                                                                            }) => {
    const {theme} = useThemeContext();
    const {user} = useAuthContext();
    const [isPreviewImageOpen, setPreviewImageOpen] = React.useState(false);
    const [imgSrc, setImgSrc] = React.useState("");
    const [file, setFile] = React.useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string>("");
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const currentUrl: string = window.location.pathname.split("/").slice(-1)[0];
    let messageEnd: HTMLDivElement | null;

    useEffect(() => {
        getGroupMessages(currentUrl);
    }, [currentUrl])

    useEffect(() => {
        scrollToEnd()
    }, [chatHistory])

    function styleSelectedMessage() {
        return theme === "dark" ? "hover-msg-dark" : "hover-msg-light";
    }

    function generateImageRender(message: FullMessageModel) {
        if (message.url === undefined) {
            return null;
        }
        return (
            <div>
                <img src={message.url} height={"200px"} alt={message.name}
                     onClick={event => handleImagePreview(event, "OPEN", message.url)}
                     style={{border: "1px solid #c8c8c8", borderRadius: "7%"}}/>
            </div>
        )
    }

    function resetImageBuffer(event: any) {
        event.preventDefault();
        setFile(null);
        setImagePreviewUrl("");
        setImageLoaded(false);
    }

    function previewFile(event: any) {
        resetImageBuffer(event);
        let reader = new FileReader();
        let file = event.target.files[0];
        reader.readAsDataURL(file)

        reader.onload = (e) => {
            if (e.target && e.target.readyState === FileReader.DONE) {
                setFile(file);
                setImagePreviewUrl(reader.result as string);
                setImageLoaded(true);
            }
        };
    }

    function submitMessage(event: any) {
        if (message !== "") {
            if (event.key === undefined || event.key === 'Enter') {
                sendMessage();
                setMessage("");
            }
        }
    }

    function handleChange(event: any) {
        setMessage(event.target.value);
    }

    function sendMessage() {
        if (user?.id === null || undefined) {
            console.warn("userId is null !")
        }
        if (message !== "") {
            const messageModel = new MessageModel(user?.id, currentUrl, message)
            const reduxModel = new ReduxModel(undefined, undefined, currentUrl || "", user?.id as number, messageModel)
            sendWsMessage(reduxModel)
            setMessage("")
        }
        if (file !== null) {
            console.log("Publishing file");
            const formData = new FormData();
            formData.append("file", file)
            formData.append("userId", user?.id as string || "")
            formData.append("groupUrl", currentUrl || "")
            new AuthService().uploadFile(formData).then().catch((err: AxiosError) => {
                console.log(err)
            })
            setMessage("")
            setImageLoaded(false)
            setFile(null)
            setImagePreviewUrl("")
        }
        // updateGroupsOnMessage(groupUrl, wsUserGroups)
    }

    function scrollToEnd() {
        messageEnd?.scrollIntoView({behavior: "auto"});
    }

    function handleImagePreview(event: any, action: string, src: string) {
        event.preventDefault();
        switch (action) {
            case "OPEN":
                setImgSrc(src)
                setPreviewImageOpen(true)
                break;
            case "CLOSE":
                setPreviewImageOpen(false)
                break;
            default:
                throw new Error("handleImagePreview failed");
        }
    }

    // function openCallPage() {
    //     const callUrl = UUIDv4();
    //     window.open("http://localhost:3000/call/" + callUrl, '_blank', "location=yes,height=570,width=520,scrollbars=yes,status=yes");
    // }

    function markMessageSeen() {
        markMessageAsSeen(currentUrl)
    }

    return (
        <div style={{display: "flex", flex: "1", flexDirection: "column"}}>
            <div style={{
                backgroundColor: "transparent",
                width: "100%",
                height: "calc(100% - 56px)",
                overflowY: "scroll"
            }}>
                <ImagePreview displayImagePreview={isPreviewImageOpen}
                              changeDisplayImagePreview={handleImagePreview}
                              isDarkModeEnable={theme}
                              imgSrc={imgSrc}
                />
                {chatHistory && chatHistory.map((val, index, array) => (
                    <Tooltip
                        key={index}
                        enterDelay={700}
                        leaveDelay={0}
                        title={new Date(val.time).getHours() + ":" + new Date(val.time).getMinutes()}
                        placement="left">
                        <div className={'msg ' + styleSelectedMessage()} key={index}
                             style={{display: "flex", alignItems: "center"}}>
                            {index >= 1 && array[index - 1].userId === array[index].userId ?
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                }}/>
                                :
                                <div style={{
                                    fontFamily: "Segoe UI,SegoeUI,\"Helvetica Neue\",Helvetica,Arial,sans-serif",
                                    backgroundColor: `${val.color}`,
                                    letterSpacing: "1px",
                                    width: "40px",
                                    height: "40px",
                                    textAlign: "center",
                                    fontSize: "20px",
                                    borderRadius: " 50%",
                                    lineHeight: "37px"
                                }}>
                                    <div style={{color: "#FFFFFF"}}>{val.initials}</div>
                                </div>
                            }
                            <div style={{margin: "4px"}}>
                                {index >= 1 && array[index - 1].userId === array[index].userId ?
                                    <div/>
                                    :
                                    <div>
                                        <b>{val.sender} </b>
                                    </div>
                                }
                                {
                                    val.type === "TEXT" ?
                                        <div>
                                            {val.message}
                                        </div>
                                        :
                                        <div>
                                            {generateImageRender(val)}
                                        </div>
                                }
                            </div>
                        </div>
                    </Tooltip>
                ))}
                <div style={{float: "left", clear: "both"}}
                     ref={(el) => {
                         messageEnd = el;
                     }}>
                </div>
            </div>
            <div style={{display: "flex", flexDirection: "column"}}>
                <div style={{boxSizing: "border-box", borderBottom: "0.5px solid #C8C8C8"}}>
                    {
                        imagePreviewUrl &&
                        <div style={{
                            padding: "10px",
                            height: "120px",
                            maxWidth: "120px",
                            background: "url('" + imagePreviewUrl + "')",
                            backgroundSize: "cover",
                            position: "relative",
                            borderRadius: "10%"
                        }}>
                            <IconButton style={{
                                height: "20px",
                                position: "absolute",
                                right: "8px",
                                top: "8px",
                                width: "20px"
                            }}
                                        onClick={event => resetImageBuffer(event)}>
                                <HighlightOffIcon/>
                            </IconButton>
                        </div>
                    }
                </div>
                <div style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    position: "relative",
                    bottom: "0",
                    padding: "5px"
                }}>
                    <input
                        accept="image/*"
                        style={{display: 'none'}}
                        id="raised-button-file"
                        multiple
                        type="file"
                        onChange={event => previewFile(event)}
                    />
                    {/*<Button onClick={event => openCallPage(event)} variant="text" component="span">*/}
                    {/*    <CallIcon/>*/}
                    {/*</Button>*/}
                    {/*<Button onClick={event => openCallPage(event)} variant="text" component="span">*/}
                    {/*    <AcUnitIcon/>*/}
                    {/*</Button>*/}
                    {/*<CallWindowContainer/>*/}
                    <label htmlFor="raised-button-file">
                        <Button variant="text" component="span">
                            <ImageIcon/>
                        </Button>
                    </label>
                    <CustomTextField
                        id={"inputChatMessenger"}
                        label={"Write a message"}
                        value={message}
                        onClick={markMessageSeen}
                        handleChange={(event: any) => handleChange(event)}
                        type={"text"}
                        keyUp={submitMessage}
                        isDarkModeEnable={theme}
                    />
                    <Button
                        onClick={sendMessage}
                        variant="contained"
                        color="primary"
                        style={{
                            marginLeft: "3px",
                            maxWidth: "20px"
                        }}
                        disabled={!imageLoaded && message === ""}
                    >
                        <DoubleArrowIcon/>
                    </Button>
                </div>
            </div>
        </div>
    )
}