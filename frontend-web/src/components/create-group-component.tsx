import React, {useState} from "react";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import CustomTextField from "../design/partials/custom-material-textfield";
import Button from "@material-ui/core/Button";
import AuthService from "../service/auth-service";
import {useHistory} from "react-router-dom";
import {useThemeContext} from "../context/theme-context";


export const CreateGroupComponent = () => {
    const history = useHistory();
    const [groupName, setGroupName] = useState("");
    const {theme} = useThemeContext();

    function handleChange(event: any) {
        event.preventDefault();
        setGroupName(event.target.value);
    }

    function createGroup(event: any) {
        event.preventDefault();
        if (groupName !== "") {
            new AuthService().createGroup(groupName).then(r => {
                history.push({
                    pathname: "/t/messages/" + r.data
                })
            }).catch(err => {
                console.log(err)
            })
        }
    }

    function submitGroupCreation(event: any) {
        if (event.key === undefined || event.key === 'Enter') {
            if (groupName === "") {
                return;
            }
            createGroup(event)
        }
    }

    return (
        <div className={theme}
             style={{height: "calc(100% - 64px)", textAlign: "center", paddingTop: "40px"}}>
            <Container className={"clrcstm"} component="main" maxWidth="xs">
                <CssBaseline/>
                <div className={"main-register-form clrcstm"}>
                    <Typography className={"clrcstm"} variant="h6">
                        Create a group
                    </Typography>
                </div>
                <div className={"clrcstm"}>
                    <Grid className={"clrcstm"} container spacing={2}>
                        <Grid className={"clrcstm"} item xs={12}>
                            <CustomTextField id={"createGroupMessenger"}
                                             label={"Type a name for your group"}
                                             name={"groupName"}
                                             handleChange={handleChange}
                                             value={groupName}
                                             type={"text"}
                                             keyUp={submitGroupCreation}
                                             isDarkModeEnable={theme}/>
                        </Grid>
                        <div>
                            <Grid item xs={12}>
                                <Button
                                    className={"button-register-form"}
                                    style={{marginTop: "15px"}}
                                    onClick={(event) => createGroup(event)}
                                    fullWidth
                                    variant="outlined"
                                    color="primary"
                                >
                                    Create
                                </Button>
                            </Grid>
                        </div>
                    </Grid>
                </div>
            </Container>
        </div>
    )
}

