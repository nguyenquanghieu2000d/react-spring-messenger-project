import React, {useState} from "react";
import {generateIconColorMode, generateLinkColorMode} from "../design/style/enable-dark-mode";
import LockIcon from "@material-ui/icons/Lock";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import CustomTextField from "../design/partials/custom-material-textfield";
import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";
import Box from "@material-ui/core/Box";
import AuthService from "../service/auth-service";
import {useHistory} from "react-router-dom";
import {useThemeContext} from "../context/theme-context";
import {useAuthContext} from "../context/auth-context";
import UserModel from "../model/user-model";
import {AxiosResponse} from "axios";
import {useAlertContext} from "../context/alert-context";
import {FeedbackModel} from "../model/feedback-model";
import UUIDv4 from "../utils/uuid-generator";

interface LoginComponentType {

}

export const LoginComponent: React.FunctionComponent<LoginComponentType> = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const history = useHistory();
    const {theme} = useThemeContext();
    const {setUser} = useAuthContext();
    const {alerts, setAlerts} = useAlertContext();

    function handleChange(e: any) {
        e.preventDefault();
        switch (e.target.name) {
            case "username":
                setUsername(e.target.value);
                break;
            case "password":
                setPassword(e.target.value);
                break;
            default:
                throw Error("Whoops ! Something went wrong...");
        }
    }

    function submitLogin(event: any) {
        if (event.key === undefined || event.key === 'Enter') {
            if (!username || !password) {
                return;
            }
            login()
        }
    }

    function login() {
        new AuthService().authenticate(username, password).then((res: AxiosResponse<UserModel>) => {
                if (res.status === 200) {
                    setAlerts([...alerts, new FeedbackModel(UUIDv4(), "You are connected", "info", true)])
                    setUser(res.data)
                    history.push("/");
                }
            }
        ).catch((err) => {
            console.log(err)
            setAlerts([...alerts, new FeedbackModel(UUIDv4(), err.toString(), "error", true)])
            setUsername("");
            setPassword("");
        })
    }

    return (
        <div className={theme}
             style={{height: "calc(100% - 64px)", width: "100%"}}>
            <div className={"main-register-form"}>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <LockIcon fontSize={"large"}
                              className={generateIconColorMode(theme)}
                    />
                </div>
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <div>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <CustomTextField id={"loginUsernameInput"}
                                             label={"Username"}
                                             name={"username"}
                                             value={username}
                                             isDarkModeEnable={theme}
                                             handleChange={handleChange}
                                             type={"text"}/>
                        </Grid>
                        <Grid item xs={12}>
                            <CustomTextField id={"loginPasswordInput"}
                                             label={"Password"}
                                             name={"password"}
                                             value={password}
                                             isDarkModeEnable={theme}
                                             handleChange={handleChange}
                                             type={"password"}
                                             keyUp={submitLogin}
                            />
                        </Grid>
                    </Grid>
                    <div>
                        <Grid item xs={12}>
                            <Button
                                className={"button-register-form"}
                                style={{marginTop: "15px"}}
                                onClick={(event) => submitLogin(event)}
                                fullWidth
                                variant="contained"
                                color="primary"
                            >
                                Valider
                            </Button>
                        </Grid>
                    </div>
                    <Grid container
                          direction="row"
                          justify="space-between">
                        <Link className={"lnk"}
                              style={{color: generateLinkColorMode(theme)}}
                              to={"/forgetpassword"}>
                            Mot de passe oublié ?
                        </Link>
                        <Link className={"lnk"}
                              style={{color: generateLinkColorMode(theme)}}
                              to={"/register"}>
                            S'enregistrer
                        </Link>
                    </Grid>
                </div>
                <Box mt={5}>
                    <Typography variant="body2" color="inherit" align="center">
                        {'Copyright © '}
                        <Link to="/" className={"lnk"}
                              style={{color: generateLinkColorMode(theme)}}
                        >
                            Software Technologies
                        </Link>{' '}
                        {new Date().getFullYear()}
                        {'.'}
                    </Typography>
                </Box>
            </div>
        </div>
    )
}