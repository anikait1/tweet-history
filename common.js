const DB_KEY = "tweets-history";
async function loadHistoryFromStorage() {
  const tweetsDB = await browser.storage.local.get([DB_KEY]);
  return DB_KEY in tweetsDB ? tweetsDB[DB_KEY] : {};
}
