const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);

readFile(`./tweets.json`, { encoding: "utf8" })
    .then(data => {
        let tweets = JSON.parse(data);
        console.log(tweets.statuses.length);
    })
    .catch(err => console.log(err));
