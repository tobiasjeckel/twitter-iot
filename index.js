const express = require("express");
const app = express();
const twitter = require("./twitter");
const util = require("util");
const getToken = util.promisify(twitter.getToken);
const getTweets = util.promisify(twitter.getTweets);

app.use(express.static("./public"));

// app.get("/tweets.json", (req, res) => {
//     let numOfTweets = 0;
//     let requestCounter = 0;
//     const queryText = "%23IOT";
//     getToken().then(token => {
//         getTweets(
//             token,
//             `?q=${queryText}&lang=de&count=100&include_entities=false`
//         )
//             .then(tweets => {
//                 if (tweets.statuses.length == 100 && requestCounter <= 10) {
//                     numOfTweets += 100;
//                     console.log(
//                         "do another query to ",
//                         tweets.search_metadata.next_results
//                     );
//                     requestCounter++;
//                     console.log("req counter: ", requestCounter);
//                     getTweets(token, tweets.search_metadata.next_results);
//                 } else {
//                     // console.log(tweets.statuses.length);
//                     numOfTweets += tweets.statuses.length;
//                     res.send("number of tweets: " + numOfTweets);
//                 }
//             })
//             .catch(err => {
//                 console.log(err);
//                 res.sendStatus(500);
//             });
//     });
// });

app.get("/tweets.json", async (req, res) => {
    let numOfTweets = 0;
    let requestCounter = 0;
    const queryText = "internetderdinge";
    // const lang = "de";
    const firstQuery = `?q=${queryText}&count=100&include_entities=false&result_type=recent`;

    try {
        const token = await getToken();

        const oneHourAgo = date => {
            const hour = 1000 * 60 * 60 * 24;
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
                res.send("number of tweets: " + numOfTweets);
            }
        };
        getRecurTweets(firstQuery);
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.listen(8080, () => console.log("server is listening"));
