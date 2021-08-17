export const generateColorMode = (isDarkMode) => {
    return isDarkMode === "dark" ? "dark" : "light";
}

export const generateIconColorMode = (isDarkMode) => {
    return isDarkMode === "dark" ? "#4A4A4A" : "#dcdcdc"
}

export const generateInputTextColorMode = (isDarkMode) => {
    return isDarkMode === "dark" ? "white" : "black"
}

export const generateLinkColorMode = (isDarkMode) => {
    return isDarkMode === "dark" ? "white" : "black"
}

export const generateClassName = (isDarkMode) => {
    return isDarkMode === "dark" ? "dark-t" : "light-t";
}