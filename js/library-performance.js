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

/** @var {object} $ */

(async function () {
  const FILE_SIZE_MULTIPLIER = {
    B:   Math.pow(1024, 0),
    KiB: Math.pow(1024, 1),
    MiB: Math.pow(1024, 2),
    GiB: Math.pow(1024, 3),
    TiB: Math.pow(1024, 4),
    PiB: Math.pow(1024, 5),
    EiB: Math.pow(1024, 6),
    ZiB: Math.pow(1024, 7),
    YiB: Math.pow(1024, 8)
  };

  // A script that will be inserted into the page to get access to variables in its context.
  // Then it will be able to send those variables to the extension using a custom event.
  let script = document.createElement('script');
  script.innerHTML = `
document.addEventListener('GameListPerformanceFix:Request', e => {
  var result;
  if(typeof e.detail === 'object') {
    result = {};
    for(let key of e.detail) {
      result[key] = window[key];
    }
  } else {
    result = window[e.detail];
  }
  var event = new CustomEvent('GameListPerformanceFix:Response', { detail: result });
  document.dispatchEvent(event);
});
`;
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
  let cb, resolve;

  /**
   * Passes the list of required variables to the injected script in the page context.
   * @param {string|string[]} variables
   * @param {function} callback
   */
  function get(variables, callback) {
    let event = new CustomEvent('GameListPerformanceFix:Request', { detail: variables });
    cb = callback;
    document.dispatchEvent(event);
  }
  /** Same as {@link get|get}, but instead of requiring a callback, it returns a promise. */
  get.promise = function(variables) {
    return new Promise((res, rej) => {
      resolve = res;
      get(variables, null);
    });
  };
  /** Event listener for when the injected script sends a response containing the requested variables **/
  document.addEventListener('GameListPerformanceFix:Response', e => {
    if(resolve) {
      resolve(e.detail);
      resolve = null;
    } else if(cb) {
      cb(e.detail);
    }
  });
  window.get = get;


  /**
   * Same as <code>chrome.storage[area].get</code>, but with a promise instead of a callback
   * @param {string|string[]|object|object[]} keys
   * @returns {Promise}
   */
  function get(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage[this].get(keys, data => {
        resolve(data);
      });
    });
  }
  /**
   * Same as <code>chrome.storage[area].set</code>, but with a promise instead of a callback
   * @param {object|object[]} data
   * @returns {Promise}
   */
  function set(data) {
    return new Promise((resolve, reject) => {
      chrome.storage[this].set(data, () => {
        resolve();
      });
    });
  }
  window.storage = {
    get: get.bind('local'),
    set: set.bind('local'),
    sync: {
      get: get.bind('sync'),
      set: set.bind('sync')
    }
  };


  let library = await storage.sync.get({
    library: {
      perPage: 15,
      enabled: true,
      sortBy: 'name'
    }
  });
  library = library.library;
  if (!library.enabled)
    return;

  let s = document.createElement('script');
  s.innerHTML = `(function() {
  Object.defineProperty(window, 'rgGames', {
    configurable: true,
    get() {
      return [];
    },
    set(newValue) {
      window.SLIWIPI_rgGames = newValue;
    }
  });

  function onReady() {
    let str = window.BuildGameRow.toString().split('\\n');

    function comment(line) {
      str[line] = '//' + str[line];
    }

    if (str.length !== 111)
      return;

    /* I think including the actual code from the page with slight modifications
     would be illegal?.. So this array contains the numbers of lines in the original
     function that should be commented out. */
    let lines = [
      69, 70, 71, 72, 73, 74,
      81, 82, 83, 84,
      92, 93, 94, 95,
      98,
      100, 101, 102, 103, 104, 105,
      107, 108, 109
    ];

    for (let line of lines) {
      comment(line);
    }

    let s = document.createElement('script');
    s.innerHTML = str.join('\\n');
    document.head.appendChild(s);
    s.parentNode.removeChild(s);

    window.SLIWIPI_BUILD_GAME_ROW_PATCHED = true;

    delete window.rgGames;
    window.rgGames = window.SLIWIPI_rgGames;
    delete window.SLIWIPI_rgGames;
  }

  document.addEventListener('DOMContentLoaded', onReady);
})();`
  //s.src = chrome.extension.getURL('/js/BuildGameRow-injectable.js');
  document.documentElement.appendChild(s);
  s.parentNode.removeChild(s);

  async function onReady() {

    let link1 = document.createElement('link');
    link1.setAttribute('rel', 'stylesheet');
    link1.setAttribute('href', chrome.extension.getURL('/css/common.css'));
    document.head.appendChild(link1);

    let link2 = document.createElement('link');
    link2.setAttribute('rel', 'stylesheet');
    link2.setAttribute('href', chrome.extension.getURL('/css/library-performance.css'));
    document.head.appendChild(link2);

    let html = await (await fetch(chrome.extension.getURL('/html/library.html'))).text();

    let s = document.createElement('script');
    s.innerHTML = `window.SLIWIPI = { 
      perPage: ${library.perPage},
      fileSizeMultipliers: ${JSON.stringify(FILE_SIZE_MULTIPLIER)},
      sortBy: ${JSON.stringify(library.sortBy)},
      html: \`${encodeURIComponent(html)}\`
    };`;
    document.body.appendChild(s);
    s.parentNode.removeChild(s);

    s = document.createElement('script');
    s.innerHTML = await (await fetch(chrome.extension.getURL('/js/thenBy.js'))).text();
    document.body.appendChild(s);
    s.parentNode.removeChild(s);

    s = document.createElement('script');
    s.innerHTML = await (await fetch(chrome.extension.getURL('/js/library-performance-injectable.js'))).text();
    document.body.appendChild(s);
    s.parentNode.removeChild(s);
  }

  if(document.readyState === 'interactive' || document.readyState === 'complete')
    onReady();
  else
    document.addEventListener('DOMContentLoaded', onReady);
})();