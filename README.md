# Twitter IoT-App Challenge

The goal of this project was to demonstrate my capability to create a node.js application that fetches data from the Twitter API.

This app contacts the [Twitter Standard Search API](https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets) and does two main things:

-   It collects and displays the most popular tweets of the past **7 days** regarding the topic **IOT**
-   It calculates and displays **how many tweets** were published by **how many users** in the past **hour**

## Installation instructions to install on a local machine

-   Clone the repo to your local machine
-   cd into the cloned directory
-   Type `npm install` in the terminal
-   Add a secrets.json file to the directory. Of course this file has not been pushed to GitHub. Enter your Twitter consumerKey and consumerSecret into this file. [Click here for instructions on how to obtain a Twitter Acces Tokens](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens). I am also using basicAuth - just enter some basicAuthName and basicAuthPass that you wish to use.
    -   paste this code into secrets.json:
    -   `{ "consumerKey": "ENTERYOURTWITTERCONSUMERKEYHERE", "consumerSecret": "ENTERYOURTWITTERCONSUMERSECRETHERE", "basicAuthName": "ENTERSOMENAMEHERE", "basicAuthPass": "ENTERSOMEPASSWORDHERE" }`
-   The app is now accesible at http://localhost:8080/ in your Browser. Enjoy 😊.

## Documentation

Documentation was created with JSDOC and is contained in the folder /docs.

## Outlook and goals for further improvement of the app

-   Improve the JSDOC documentation of the Express.js routes - JSDoc does not seem well suited to accomplish this. I will probably look into [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc) for doing this.
-   A major challenge was to calculate the number of tweets with the free version of the Twitter Search API. Only 100 tweets can be returned per request. Therefore, several requests need to made to find how many tweets were made in the last hour for popular topics like "IOT". For a scalable solution to calculate the number of tweets for a certain topic with high precision, one would need to use the [counts endpoint](https://developer.twitter.com/en/docs/tweets/search/api-reference/premium-search#CountsEndpoint) which is part of the premium search API that costs money to access.
-   Implement a search interface to enter different queries like "Internet of Things", "IoT", "Internet der Dinge" etc.
