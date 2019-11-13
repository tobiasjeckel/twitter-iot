//these two functions are exported from here so it can be called from index.js"

const https = require("https");
const { consumerKey, consumerSecret } = require("./secrets");
const authorization =
    `Basic ` +
    Buffer.from(consumerKey + ":" + consumerSecret).toString("base64");

exports.getToken = callback => {
    const req = https.request(
        {
            method: "POST",
            host: "api.twitter.com",
            path: "/oauth2/token",
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8",
                Authorization: authorization
            }
        },
        resp => {
            if (resp.statusCode != 200) {
                console.log(resp.statusCode);
                callback(resp.statusCode);
            } else {
                let body = "";
                resp.on("data", chunk => {
                    body += chunk;
                })
                    .on("end", () => {
                        try {
                            callback(null, JSON.parse(body).access_token);
                        } catch (err) {
                            console.log(err);
                            callback(err);
                        }
                    })
                    .on("error", err => callback(err));
            }
        }
    );
    req.on("error", err => callback(err));
    req.end(`grant_type=client_credentials`);
};

exports.getTweets = (token, query, callback) => {
    const authorization = "Bearer " + token;
    //https get request with screenname etc.
    const req = https.request(
        {
            method: "GET",
            host: "api.twitter.com",
            path: `/1.1/search/tweets.json${query}`,
            headers: {
                Authorization: authorization
            }
        },
        resp => {
            if (resp.statusCode != 200) {
                console.log(resp.statusCode);
                callback(resp.statusCode);
            } else {
                let body = "";
                resp.on("data", chunk => {
                    body += chunk;
                })
                    .on("end", () => {
                        try {
                            callback(null, JSON.parse(body));
                        } catch (err) {
                            console.log(err);
                            callback(err);
                        }
                    })
                    .on("error", err => callback(err));
            }
        }
    );
    req.on("error", err => callback(err));
    req.end(`grant_type=client_credentials`);
};
