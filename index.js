const twitter = require("./twitter");
const util = require("util");
const getToken = util.promisify(twitter.getToken);
const getTweets = util.promisify(twitter.getTweets);
const getEmbed = util.promisify(twitter.getEmbed);

/** Basic auth to restrict access. Name and password is imported from .secrets file while in dev mode in order to prevent it being pushed to GitHub.*/
const basicAuth = require("basic-auth");
const { basicAuthName, basicAuthPass } = require("./secrets");
const auth = function(req, res, next) {
    const creds = basicAuth(req);
    if (!creds || creds.name != basicAuthName || creds.pass != basicAuthPass) {
        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="Enter your credentials to see this stuff."'
        );
        res.sendStatus(401);
    } else {
        next();
    }
};

/** Express router providing user related routes
 * @module app
 * @requires express
 */

/**
 * express module
 * @const
 */
const express = require("express");

/**
 * Express router handle requests
 * @type {object}
 * @const
 * @namespace router
 */
const app = express();

app.use(auth);
app.use(express.static("./public"));

/**
 * route to obtain the number tweets and users who tweeted in the last hour
 * @name get/api/tweetslasthour
 * @function
 * @memberof module:app~router
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @param {object} res - json object with number of tweets and users
 */
app.get("/api/tweetslasthour", async (req, res) => {
    //counter to count the number of requests that have been made to the twitter API
    let requestCounter = 0;

    //define the search term to search for
    const queryText = "IOT";

    //first query string for the first request that is made to the api

    const firstQuery = `?q=${queryText}&count=100&include_entities=false&result_type=recent`;

    // array into which the tweets will be pushed
    let tweetsInLastHour = [];

    try {
        //get the authentication token from twitter API
        const token = await getToken();

        //function parses the created_at date received from Twitter API
        const parseTwitterDate = aDate => {
            return new Date(Date.parse(aDate.replace(/( \+)/, " UTC$1")));
        };

        //function checks if date is within the last hour

        const oneHourAgo = date => {
            const hour = 1000 * 60 * 60;
            const hourago = Date.now() - hour;
            return date > hourago;
        };

        //function gets tweets from Twitter search API

        const getRecurTweets = async queryString => {
            /** get tweets from Twitter search API*/
            const tweets = await getTweets(token, queryString);
            /** get an array of parsed created_at dates*/
            const parsedTwitterDates = tweets.statuses.map(status =>
                parseTwitterDate(status.created_at)
            );

            // make a maximum of 20 requests. If the response has the maximum number of tweets and the tweets were all made within the last hour, then make a new request to get more tweets
            if (
                requestCounter < 20 &&
                tweets.statuses.length == 100 &&
                parsedTwitterDates.every(oneHourAgo)
            ) {
                requestCounter++;
                tweetsInLastHour.push(...tweets.statuses);
                console.log("fetch more tweets");
                getRecurTweets(tweets.search_metadata.next_results);
            } else {
                //If there are less tweets made within the last hour than the maximum amount of tweets per request, then it is assumed there are no more tweets to fetch. Then loop through the tweets and add those that are made within the last hour.
                console.log("done");
                tweets.statuses.forEach(status => {
                    if (oneHourAgo(parseTwitterDate(status.created_at))) {
                        tweetsInLastHour.push(status);
                    }
                });

                //get unique tweet ids to make sure API didnt return duplicate tweets
                let tweetIds = tweetsInLastHour.map(status => status.id);
                let uniqueTwitterIds = [...new Set(tweetIds)]; //make sure no duplicate tweets are sent

                //get unique user ids
                let userIds = tweetsInLastHour.map(status => status.user.id);
                let uniqueUserIds = [...new Set(userIds)];

                //respond with number of tweets and number of users
                res.json({
                    numTweets: uniqueTwitterIds.length,
                    numUsers: uniqueUserIds.length
                });
            }
        };
        getRecurTweets(firstQuery);
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

/**
 * route to obtain the most popular tweets published in the last 7 days
 * @name get/api/populartweets
 * @function
 * @memberof module:app~router
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @param {string} res - string of html with popular tweets
 */
app.get("/api/populartweets", async (req, res) => {
    //No recursion needed as only a few popular tweets are needed to display. result_type is set to "popular"
    const queryText = "IOT";
    const query = `?q=${queryText}&count=100&include_entities=false&result_type=popular`;
    try {
        const token = await getToken();
        const tweets = await getTweets(token, query);
        let tweetHtml = "";
        for (let i = 0; i < tweets.statuses.length; i++) {
            let chunk = await getEmbed(tweets.statuses[i]);
            tweetHtml += chunk.html;
        }
        res.send(tweetHtml);
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.listen(process.env.PORT || 8080, () => {
    console.log("server is running");
});
