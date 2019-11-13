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
    const queryText = "%23IOT";
    const lang = "de";
    const firstQuery = `?q=${queryText}&lang=${lang}&count=100&include_entities=false`;

    try {
        const token = await getToken();
        // console.log(token);
        const getRecurTweets = async queryString => {
            const tweets = await getTweets(token, queryString);
            if (requestCounter <= 100 && tweets.statuses.length == 100) {
                console.log(
                    "another request to: ",
                    tweets.search_metadata.next_results
                );
                requestCounter++;
                numOfTweets += 10;
                console.log("num of tweets: ", numOfTweets);
                getRecurTweets(tweets.search_metadata.next_results);
            } else {
                console.log("finished");
                numOfTweets += tweets.statuses.length;
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
