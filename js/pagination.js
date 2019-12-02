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

(function() {
  function generatePagination(currentPage, elements, perPage) {
    let html = '';
    let totalPages = Math.ceil(elements.length / perPage);
    if (totalPages <= 1)
      return '';
    if (currentPage > 1)
      html += '<button type="button" class="pagination-navprev btnv6_blue_hoverfade" data-locale-text="pagination_button_prev">&lt; prev</button>';
    if(currentPage !== 1)
      html += '<button type="button" class="btnv6_blue_hoverfade">1</button>';
    else
      html += '<span>1</span>';
    if(currentPage === 5)
      html += '<button type="button" class="btnv6_blue_hoverfade">2</button>';
    if (currentPage > 2) {
      if(currentPage > 5)
        html += '<span>...</span>';
      if (currentPage > 3)
        html += '<button type="button" class="btnv6_blue_hoverfade">' + (currentPage - 2) + '</button>';
      html += '<button type="button" class="btnv6_blue_hoverfade">' + (currentPage - 1) + '</button>';
    }
    if (currentPage !== 1 && currentPage !== totalPages)
      html += '<span>' + currentPage + '</span>';
    if (currentPage < totalPages - 1) {
      html += '<button type="button" class="btnv6_blue_hoverfade">' + (currentPage + 1) + '</button>';
      if (currentPage < totalPages - 2)
        html += '<button type="button" class="btnv6_blue_hoverfade">' + (currentPage + 2) + '</button>';
      if(currentPage < totalPages - 4)
        html += '<span>...</span>';
    }
    if(currentPage === totalPages - 4)
      html += '<button type="button" class="btnv6_blue_hoverfade">' + (totalPages - 1) + '</button>';
    if(currentPage !== totalPages)
      html += '<button type="button" class="btnv6_blue_hoverfade">' + totalPages + '</button>';
    else
      html += '<span>' + totalPages + '</span>';
    if (currentPage < totalPages)
      html += '<button type="button" class="pagination-navnext btnv6_blue_hoverfade" data-locale-text="pagination_button_next">next &gt;</button>';
    return html;
  }



  /**
   * @name PaginationPluginParams
   * @property {number} currentPage
   * @property {object[]} elements
   * @property {number} perPage Amount of items displayed per page
   */
  /**
   * @param {PaginationPluginParams} obj
   */
  function pagination(elem,obj) {
    let html = generatePagination(obj.currentPage, obj.elements, obj.perPage);    
    let clickListener = function (event){
        let inner = event.target;
        if (inner.tagName != "BUTTON") return;
        let newPage = inner.textContent;
        if (inner.classList.contains('pagination-navprev'))
          obj.currentPage--;
        else if (inner.classList.contains('pagination-navnext'))
          obj.currentPage++;
        else
          obj.currentPage = +newPage;
        let html = generatePagination(obj.currentPage, obj.elements, obj.perPage);
        elem.innerHTML = html;
        obj.change(obj.currentPage);

    }

    elem.removeEventListener("click",clickListener);
    elem.addEventListener("click",clickListener);
    elem.innerHTML = html;
  };
  window.pagination = pagination;
})();
