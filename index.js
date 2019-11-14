const express = require("express");
const app = express();
const twitter = require("./twitter");
const util = require("util");
const getToken = util.promisify(twitter.getToken);
const getTweets = util.promisify(twitter.getTweets);

app.use(express.static("./public"));

app.get("/tweetslasthour", async (req, res) => {
    let requestCounter = 0;
    const queryText = "IOT";
    // const lang = "de";
    const firstQuery = `?q=${queryText}&count=100&include_entities=false&result_type=recent`;

    let tweetsInLastHour = [];

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
            const parsedTwitterDates = tweets.statuses.map(status =>
                parseTwitterDate(status.created_at)
            );
            //limited to 20 requests, therefore maximum of 2000 tweets per hour can be counted
            if (
                requestCounter < 20 &&
                tweets.statuses.length == 100 &&
                parsedTwitterDates.every(oneHourAgo)
            ) {
                requestCounter++;
                tweetsInLastHour.push(...tweets.statuses);
                console.log("fetch more");
                getRecurTweets(tweets.search_metadata.next_results);
            } else {
                console.log("done");
                tweets.statuses.forEach(status => {
                    if (oneHourAgo(parseTwitterDate(status.created_at))) {
                        tweetsInLastHour.push(status);
                    }
                });

                let userIds = tweetsInLastHour.map(status => status.user.id);
                let tweetIds = tweetsInLastHour.map(status => status.id);
                let uniqueUserIds = [...new Set(userIds)];
                let uniqueTwitterIds = [...new Set(tweetIds)]; //make sure no duplicate tweets are sent

                console.log(
                    `tweets: ${tweetsInLastHour.length}, unique Users: ${uniqueUserIds.length}, unique Tweets: ${uniqueTwitterIds.length}`
                );
                console.log("first tweet: ", tweetsInLastHour[0].created_at);
                console.log(
                    "last tweet: ",
                    tweetsInLastHour[tweetsInLastHour.length - 1].created_at
                );
                res.sendStatus(200);
            }
        };
        getRecurTweets(firstQuery);
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.get("/populartweets", async (req, res) => {
    //getting max 100 popular tweets is enough
    const queryText = "IOT";
    const query = `?q=${queryText}&count=100&include_entities=false&result_type=popular`;
    // let populartweets = [];
    try {
        const token = await getToken();
        const tweets = await getTweets(token, query);
        console.log(tweets);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.listen(8080, () => console.log("server is listening"));
