const fetchStats = () => {
    axios("/api/tweetslasthour").then(res => {
        console.log(res.data);
        document.getElementById(
            "tweetstats"
        ).innerHTML = `In the past hour, ${res.data.numTweets} tweets were published from ${res.data.numUsers} unique users about the topic <strong>'IOT'</strong>.`;
    });
};

const fetchPopularTweets = () => {
    axios.get("/api/populartweets").then(res => {
        // console.log(res.data);
        document.getElementById("populartweets").innerHTML = res.data;
    });
};

fetchStats();
fetchPopularTweets();
