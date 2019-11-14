console.log("script is up");

const fetchStats = () => {
    fetch("/api/tweetslasthour").then(res => {
        res.json().then(res => {
            console.log(res);
            document.getElementById("tweetstats").innerHTML = res;
        });
    });
};

// fetchStats();

const fetchPopularTweets = () => {
    fetch("/api/populartweets").then(res => {
        res.text().then(res => {
            console.log(res);
            document.getElementById("populartweets").innerHTML = res;
        });
    });
};

fetchPopularTweets();
