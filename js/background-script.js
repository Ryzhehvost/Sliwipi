/*
 Copyright 2017 Yan Li

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const REGEXP_USER_LINK = /((?:\/id\/[^?\/]+)|(?:\/profiles\/\d{17}))/i;
/** Contains <code>true</code> or <code>false</code> depending on if wishlist performance improvement is enabled in options or not. */
let wishlistEnabled;
/** Retrieves the information about wishlist being enabled or not from the storage or from the storage event */
function retrieveStorageData(changes, areaName) {
  if(
    (areaName === 'sync' || !areaName) &&
    ((changes && changes.wishlist && changes.wishlist.newValue && changes.wishlist.newValue.enabled != null) || !changes)
  ) {
    if(!changes) {
      chrome.storage.sync.get({
        wishlist: {
          enabled: true
        }
      }, function (data) {
        wishlistEnabled = data.wishlist.enabled;
      });
    } else {
      wishlistEnabled = changes.wishlist.newValue.enabled;
    }
  }
}
chrome.storage.onChanged.addListener(retrieveStorageData);
retrieveStorageData();

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    // Redirect all requests to this page that aren't POST and aren't made using Ajax
    if (details.method !== 'POST' && wishlistEnabled && details.type !== 'xmlhttprequest') {
      let id = details.url.match(REGEXP_USER_LINK)[1];
      return { redirectUrl: 'http://steamcommunity.com' + id + '/games/?tab=recent#wishlist-redirected' };
    }
    return {};
  },
  {urls: ["http://steamcommunity.com/*/wishlist*", "http://steamcommunity.com/*/wishlist/?*", "http://steamcommunity.com/*/wishlist?*"]},
  ["blocking"]
);
chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    // Redirect only POST requests to this page
    if(details.method !== 'POST')
      return {};
    let id = details.url.match(REGEXP_USER_LINK)[1];
    return {
      redirectUrl: 'http://steamcommunity.com' + id + '/games/?tab=recent#wishlist-redirected'
    };
  },
  {urls: ["http://steamcommunity.com/*/wishlist*", "http://steamcommunity.com/*/wishlist/?*", "http://steamcommunity.com/*/wishlist?*"]},
  ["blocking"]
);