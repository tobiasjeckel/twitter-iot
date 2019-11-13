const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);

// readFile(`./tweets.json`, { encoding: "utf8" })
//     .then(data => {
//         let tweets = JSON.parse(data);
//         oneHourAgo(tweets.statuses[0].created_at);
//     })
//     .catch(err => console.log(err));

function parseTwitterDate(aDate) {
    return new Date(Date.parse(aDate.replace(/( \+)/, " UTC$1")));
}
const tweetTime = parseTwitterDate("Wed Nov 13 15:08:37 +0000 2019");
const now = new Date();
console.log(now);
console.log(tweetTime);

const oneHourAgo = date => {
    const hour = 1000 * 60 * 60;
    const hourago = Date.now() - hour;
    return date > hourago;
};

console.log(oneHourAgo(tweetTime));
