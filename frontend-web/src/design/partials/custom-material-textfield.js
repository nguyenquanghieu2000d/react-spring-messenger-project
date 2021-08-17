import React from 'react';
import TextField from '@material-ui/core/TextField';
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(() => ({
    labelInput: {
        color: props => props.isDarkModeEnable === "dark" ? "white" : "black",
    },
    input: {
        color: props => props.isDarkModeEnable === "dark" ? "white" : "black",
        borderColor: props => props.isDarkModeEnable === "dark" ? "white" : "black",
    },
    cssLabel: {
        color: props => props.isDarkModeEnable === "dark" ? "white" : "black",
    },
    cssFocused: {
        color: props => props.isDarkModeEnable === "dark" ? "white" : "black",
    },
}));

export default function CustomTextField(props) {
    const styles = useStyles(props);

    const handleChange = (event) => {
        props.handleChange(event);
    };

    const submitForm = (event) => {
        if (props.keyUp !== undefined) {
            props.keyUp(event);
        }
    }

    return (
        <React.Fragment>
            <TextField
                id={props.id}
                label={props.label}
                variant="outlined"
                required
                fullWidth
                value={props.value}
                autoFocus={false}
                name={props.name}
                onClick={props.onClick}
                onChange={handleChange}
                type={props.type}
                onKeyUp={event => submitForm(event)}
                InputLabelProps={{
                    classes: {
                        root: styles.cssLabel,
                        focused: styles.cssLabel
                    },
                }}
                InputProps={{
                    className: styles.input,
                }}
            />
        </React.Fragment>
    );
}
