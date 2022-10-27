const renderAvatarName = (name) => {
    if (name) {
        const namePaths = name.split(' ')
        if (namePaths.length === 1) {
            return namePaths[0].substring(0, 2).toUpperCase()
        } else {
            const lastName = namePaths[0].substring(1, 0)
            const firstName = namePaths[namePaths.length - 1].substring(1, 0)
            return lastName + firstName
        }
    }
}

export const GoSocialUtils = {
    renderAvatarName
}
