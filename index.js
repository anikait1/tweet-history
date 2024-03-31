(async () => {
  const DB_KEY = "tweets-history";
  const DB_WRITE_INTERVAL = 2000; // 2s
  const TWEET_URL_IDENTIFIER =
    ".r-bcqeeo.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-16dba41.r-xoduu5.r-1q142lx.r-1w6e6rj.r-9aw3ui.r-3s2u2q.r-1loqt21";
  const TWEET_HISTORY = await loadHistoryFromStorage();

  /**
   * Query the DOM for tweet urls
   * @returns NodeListOf<Element>
   */
  function getTweetUrlNodes() {
    return document.querySelectorAll(TWEET_URL_IDENTIFIER);
  }

  /**
   * Load existing tweet history from local storage
   * in case it is available.
   * @returns TODO add type
   */
  async function loadHistoryFromStorage() {
    const tweetsDB = await browser.storage.local.get([DB_KEY]);
    return tweetsDB;
  }

  /**
   * Writes the `TWEET_HISTORY` object to local storage.
   * TODO - make the function a bit smart
   *  1. compare last write time to last tweet time
   */
  async function writeHistoryToStorage() {
    if (Object.keys(TWEET_HISTORY).length !== 0) {
      console.log('Saved')
      await browser.storage.local.set(TWEET_HISTORY);
    }

    setTimeout(writeHistoryToStorage, DB_WRITE_INTERVAL);
  }

  /**
   * Calculate if an element is visible on viewport
   * (atleast that's what I think, still new to this)
   * Ref: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
   * @param {Element} element
   * @returns boolean
   */
  function elementVisibility(element) {
    const { top, left, bottom, right } = element.getBoundingClientRect();

    return (
      top >= 0 &&
      left >= 0 &&
      bottom <= window.innerHeight &&
      right <= window.innerWidth
    );
  }

  /**
   * Select all the tweet urls currently in user's
   * view from the passed on  and store them in the tweet history
   * object with the current timestamp
   * @param {NodeListOf<Element>} tweetUrlNodes
   */
  function filterVisibleTweetUrls(tweetUrlNodes) {
    if (tweetUrlNodes === undefined) {
      tweetUrlNodes = getTweetUrlNodes();
    }

    for (const urlNode of tweetUrlNodes) {
      if (!elementVisibility(urlNode)) {
        continue;
      }

      if (urlNode.href in TWEET_HISTORY) {
        continue;
      }

      console.log(TWEET_HISTORY)
      TWEET_HISTORY[urlNode.href] = Date.now();
    }
  }

  let executingCallback = false;
  /**
   * Callback to be executed for the on scroll event.
   * Considering the scroll event could be fired
   * very frequently, the callback maintains
   * a closure over `executingCallback` to throttle
   * the execution of the function.
   * @param {Event} event
   * @returns
   */
  function throttledTwitterScroll(event) {
    if (executingCallback) {
      return;
    }

    window.setTimeout(function throttleCallback() {
      filterVisibleTweetUrls(getTweetUrlNodes());
      executingCallback = false;
    });

    executingCallback = true;
  }

  /**
   * Callback to detect when the <main> tag is available
   * in the DOM. Current idea is, it is only useful to add the scroll
   * callback and load the initial feed data once the <main> tag
   * is available on the screen. Once the tag is visible,
   * the scroll event callback is added and observer is disconnected.
   * @param {MutationRecord[]} mutationList
   * @param {MutationObserver} observer
   */
  function observeRootDivForMainTag(mutationList, observer) {
    for (const mutation of mutationList) {
      if (mutation.type !== "childList") {
        continue;
      }

      const tweetUrlNodes = getTweetUrlNodes();
      if (tweetUrlNodes.length === 0) {
        continue;
      }

      filterVisibleTweetUrls(tweetUrlNodes);
      document.addEventListener("scroll", throttledTwitterScroll);
      observer.disconnect();
      break;
    }
  }

  const rootDiv = document.querySelector("#react-root");
  const observer = new MutationObserver(observeRootDivForMainTag);
  observer.observe(rootDiv, { childList: true, subtree: true });
  setTimeout(writeHistoryToStorage, DB_WRITE_INTERVAL);
})();
