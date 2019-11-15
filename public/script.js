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
    fetch("/api/populartweetids").then(res => {
        res.json().then(res => {
            // console.log(res);
            let tweetIds = res;
            const params = {
                hide_thread: true,
                omit_script: true
            };
            for (let i = 0; i < tweetIds.length; i++) {
                fetch(
                    `https://publish.twitter.com/oembed?url=https://twitter.com/tobiasj38281308/statuses/${tweetIds[i]}&hide_thread=${params.hide_thread}&omit_script=${params.omit_script}`,
                    { mode: "no-cors" }
                ).then(res => {
                    console.log(res);
                    // res.json().then(res => {
                    //     document
                    //         .getElementById("populartweets")
                    //         .appendChild(res);
                    // });
                });
            }
        });
    });
};

// fetchPopularTweets();

const fetchPopularTweetsAxios = () => {
    axios.get("/api/populartweets").then(res => {
        // console.log(res.data);
        res.data += `<script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>`;
        document.getElementById("populartweets").innerHTML = res.data;
    });
};

fetchPopularTweetsAxios();
