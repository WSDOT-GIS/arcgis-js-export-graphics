const ghpages = require("gh-pages");

ghpages.publish(".", {
    src: ["dist/*", "*.{html,js,css}", "!webpack.config.js"]
}, error => {
    if (error) {
        console.error(error);
    }
});