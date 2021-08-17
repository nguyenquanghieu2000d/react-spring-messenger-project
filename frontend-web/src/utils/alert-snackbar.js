import React, {useEffect, useState} from "react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";

export const Toaster = (props) => {
    const [open, setOpen] = useState(false);
    let propsOpen = props.toasterOpened;
    let currentOpen = null;

    useEffect(() => {
        console.log(propsOpen)
        if (propsOpen) {
            setOpen(true)
        }
    }, [propsOpen])

    useEffect(() => {
        console.log("EFFECT CHANGE !")
    }, [currentOpen])

    function closeAlert() {
        setOpen(false)
        propsOpen = false;
        currentOpen = false;
        console.log(propsOpen)
    }

    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            open={open}
            autoHideDuration={5000}
            onClose={() => closeAlert()}>
            <Alert onClose={() => closeAlert()}
                   severity={props.severity}
                   variant={"filled"}>
                {props.text}
            </Alert>
        </Snackbar>
    )
}
