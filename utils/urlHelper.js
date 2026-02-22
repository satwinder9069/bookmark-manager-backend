const normalizeUrl = (url) => {
    if (!url) return url;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
    }

    return url;
};

module.exports = { normalizeUrl };