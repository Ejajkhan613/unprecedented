function isValidName(name) {

    const minLength = 2;
    const maxLength = 50;
    const namePattern = /^[a-zA-Z\s]+$/; // Allow only letters and spaces

    if (!name || typeof name !== 'string') {
        return false; // Name is missing or not a string
    }

    if (name.length < minLength || name.length > maxLength) {
        return false; // Name length is outside the valid range
    }

    if (!name.match(namePattern)) {
        return false; // Name contains invalid characters
    }

    return true; // Name is valid
}


module.exports = { isValidName };