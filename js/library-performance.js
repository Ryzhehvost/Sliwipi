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

  let scripts = [];
  function addScriptCallback() {
    //console.log(window.rgGames);
    curscript = scripts.splice(0,1)[0];
    if (scripts.length>0) {
      curscript.script.onload= addScriptCallback;
    } else {
      curscript.script.onload= function(){
        console.log("callback event");
        document.addEventListener('DOMContentLoaded', onReady);
        var DOMContentLoaded_event = document.createEvent("Event")
        DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true)
        window.document.dispatchEvent(DOMContentLoaded_event)
        //onReady;
      }
    }
    curscript.target.appendChild(curscript.script);
    if (curscript.script.src=="") {
       if (scripts.length>0) {
         addScriptCallback();
       } else {
         console.log("direct event");
         document.addEventListener('DOMContentLoaded', onReady);
         //console.log("rgGames ",window.rgGames);
         //console.log("SLIWIPI_rgGames ",window.SLIWIPI_rgGames);
         var DOMContentLoaded_event = document.createEvent("Event")
         DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true)
         window.document.dispatchEvent(DOMContentLoaded_event)
         //onReady();
       }
    } 
  };

  async function onReady() {
    console.log("onready");
    if (document.querySelector('#global_header')==null) {
      let recentURL = window.location.toString().substring(0,window.location.toString().indexOf("=all"))+"=recent";
      let recentPage = await fetch (recentURL);
      let html = await recentPage.text();
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, "text/html");

      let fillDOM = function(target,source) {        
        for (let nodeIndex = 0; nodeIndex < source.childNodes.length; nodeIndex++) {
          if (source.childNodes[nodeIndex].nodeName == "SCRIPT") {      
            let buildElement = document.createElement("script");
            if (source.childNodes[nodeIndex].src.trim() != "") {
              buildElement.src=source.childNodes[nodeIndex].src;
            }
            if (source.childNodes[nodeIndex].textContent.trim() != "") {
              buildElement.textContent=source.childNodes[nodeIndex].textContent;
            }
            if (!source.childNodes[nodeIndex].textContent.includes("google")) {
              //target.appendChild(buildElement);
              scripts.push({"target":target,"script":buildElement});
            }
          } else {
	    let newElement = target.appendChild(document.importNode(source.childNodes[nodeIndex],false));
            if (source.childNodes[nodeIndex].childNodes.length > 0) {
              fillDOM(newElement,source.childNodes[nodeIndex]); //recursion
            }
          }
        }
      };
      
      fillDOM(document.head,doc.head);
      fillDOM(document.body,doc.body);
      
      let tabs = document.getElementsByClassName("sectionTab");
      tabs[0].classList.remove("active");
      tabs[1].classList.add("active");
      document.querySelector("#BG_bottom").style.setProperty('background', 'initial');
      let basebg = document.getElementById("tabs_basebg");
      let controls = document.createElement('div');
      controls.id = "gameslist_controls";
      let sortoptions = document.createElement('div');
      sortoptions.id = "gameslist_sort_options";
      sortoptions.className = "sort_options";
      controls.appendChild(sortoptions);
      let filtertext = document.createTextNode("Filter games ");
      controls.appendChild(filtertext);
      let bevel = document.createElement('div');
      bevel.className  = "gray_bevel for_text_input";
      //I have to do it as text, because it has onkeyup event handler, and filterApps in not available here.
      bevel.innerHTML = '<input type="text" id="gameFilter" name="gameFilter" onkeyup="filterApps()">'; 
      controls.appendChild(bevel);
      controls.appendChild(document.createElement('div'));
      basebg.insertBefore(controls,basebg.firstChild);      


//      console.log("injecting buildgamerow");
//      let br = await fetch(chrome.extension.getURL('/js/BuildGameRow-injectable.js'));
//      let brSrc = await br.text();
//      let s = document.createElement('script');                         
//      s.textContent = brSrc;
//      document.documentElement.appendChild(s);                          
//      s.parentNode.removeChild(s);                                      
    
      console.log(window.rgGames);

      addScriptCallback();
      return;
    }
    console.log(window.rgGames);

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
    s.src = chrome.extension.getURL('/js/debounce.js');
    document.body.appendChild(s);
    s.parentNode.removeChild(s);

    s = document.createElement('script');
    s.src = chrome.extension.getURL('/js/is-in-viewport.js');
    document.body.appendChild(s);
    s.parentNode.removeChild(s);

    s = document.createElement('script');
    s.src = chrome.extension.getURL('/js/thenBy.js');
    document.body.appendChild(s);
    s.parentNode.removeChild(s);

    s = document.createElement('script');
    s.src = chrome.extension.getURL('/js/pagination.js');
    document.body.appendChild(s);
    s.parentNode.removeChild(s);

    s = document.createElement('script');
    s.src = chrome.extension.getURL('/js/library-performance-injectable.js');
    document.body.appendChild(s);
    s.parentNode.removeChild(s);
  }

  if(document.readyState === 'interactive' || document.readyState === 'complete')
    onReady();
  else
    document.addEventListener('DOMContentLoaded', onReady);
})();