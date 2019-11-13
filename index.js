const express = require("express");
const app = express();
const twitter = require("./twitter");
const util = require("util");
const getToken = util.promisify(twitter.getToken);
const getTweets = util.promisify(twitter.getTweets);

app.use(express.static("./public"));

app.get("/tweets.json", async (req, res) => {
    let numOfTweets = 0;
    let requestCounter = 0;
    const queryText = "IOT";
    // const lang = "de";
    const firstQuery = `?q=${queryText}&count=100&include_entities=false&result_type=recent`;
    let userIds = [];

    try {
        const token = await getToken();

        const oneHourAgo = date => {
            const hour = 1000 * 60 * 60;
            const hourago = Date.now() - hour;
            return date > hourago;
        };
        const parseTwitterDate = aDate => {
            return new Date(Date.parse(aDate.replace(/( \+)/, " UTC$1")));
        };

        const getRecurTweets = async queryString => {
            const tweets = await getTweets(token, queryString);
            userIds.push(...tweets.statuses.map(status => status.user.id));
            // console.log(userIds);
            const parsedTwitterDates = tweets.statuses.map(status =>
                parseTwitterDate(status.created_at)
            );
            //limited to 20 requests, therefore maximum of 2000 tweets per second can be counted
            if (
                requestCounter < 20 &&
                tweets.statuses.length == 100 &&
                parsedTwitterDates.every(oneHourAgo)
            ) {
                requestCounter++;
                numOfTweets += 100;
                getRecurTweets(tweets.search_metadata.next_results);
            } else {
                parsedTwitterDates.forEach(date => {
                    if (oneHourAgo(date)) {
                        numOfTweets++;
                    }
                });
                let uniqueUserIds = [...new Set(userIds)];
                res.send(
                    `Number of tweets: ${numOfTweets}. Number of unique users: ${uniqueUserIds.length}`
                );
            }
        };
        getRecurTweets(firstQuery);
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.listen(8080, () => console.log("server is listening"));
