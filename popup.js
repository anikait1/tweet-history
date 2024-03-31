const TWEET_HISTORY = browser.storage.local.get(['tweets-history']).then(data => {
    console.log(data, Object.keys(data))
    const PAGE_SIZE = 10
    const tweetListNode = document.querySelector("#tweets")
    
    for (const tweet in data['tweets-history']) {
        const liNode = document.createElement("li")
        const linkNode = document.createElement("a")
        linkNode.innerText = data['tweets'][tweet]
    
        linkNode.href = tweet
        liNode.appendChild(linkNode)
        tweetListNode.appendChild(liNode)
    }

});