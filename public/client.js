fetch("/tweets.json")
    .then(function(data) {
        console.log(data);
    })
    .catch(function(error) {
        console.log(error);
    });
