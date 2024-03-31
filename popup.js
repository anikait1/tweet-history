loadHistoryFromStorage().then(tweets => {
    const tweetListNode = document.querySelector("#tweets")

    for (const tweet in tweets) {
        const liNode = document.createElement("li")
        const linkNode = document.createElement("a")

        linkNode.innerText = `${tweet}:${tweets[tweet]}`
        linkNode.href = tweet;
        liNode.appendChild(linkNode)
        tweetListNode.appendChild(liNode)
    }

})