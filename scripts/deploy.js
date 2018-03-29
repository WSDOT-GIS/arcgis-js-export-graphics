const ghpages = require("gh-pages");

ghpages.publish(".", {
    src: "*.{html,js,css}"
}, error => {
    if (error) {
        console.error(error);
    }
});