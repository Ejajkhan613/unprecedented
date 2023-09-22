function indianTime() {
    const options = {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    const currentIndianTime = new Date().toLocaleDateString('en-IN', options);
    return currentIndianTime;
}


module.exports = { indianTime };