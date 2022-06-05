"use strict";
let baseUrl =
  "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io";
let customerList = [];
let customers;
let previousCustomer;
let selectedCustomer;
let customerCounter = 0;
const treshhold = 1;

//#region ***  DOM references                           ***********
let htmlCustomerList,
  htmlSortButton,
  htmlCustomerSearch,
  htmlTitle,
  htmlRacks,
  htmlNext,
  htmlPrevious;

//#endregion

//#region ***  Callback-Visualisation - show___         ***********
const showCustomers = function () {
  let html = ``;
  for (let customer of customerList) {
    html += `
                        <button class="o-button-reset c-customer-button js-customer-button" data-customerId=${customer.customerId}>
                            <p class="o-remove-margin">${customer.name}</p>
                            <p class="o-remove-margin">${customer.total}</p>
                        </button>
  `;
  }
  htmlCustomerList.innerHTML = html;
  callbackGetSelectedCustomer();
  listenToCustomerButton();
};

const showFilteredCustomers = function (arr) {
  let html = ``;
  for (let customer of arr) {
    html += `
                        <button class="o-button-reset c-customer-button js-customer-button" data-customerId=${customer.customerId}>
                            <p class="o-remove-margin">${customer.name}</p>
                            <p class="o-remove-margin">${customer.total}</p>
                        </button>
  `;
  }
  htmlCustomerList.innerHTML = html;
  listenToCustomerButton();
};

const showSelectedCustomer = function (jsonObject) {
  if (jsonObject.length >= 1) {
    let arr = customerList.filter(function (elem) {
      return elem.customerId == jsonObject[0].customerId;
    });
    htmlTitle.innerHTML = `${arr[0].name}`;
    let html = ``;
    for (let rack of jsonObject) {
      html += `<div class="c-rack">`;
      if (rack.row1.drinks.length == 1) {
        html += `
                          <div class="c-rack-row">
                            <div class="c-rack-row-item js-rack" data-total=${
                              rack.row1.takenLeft + rack.row1.takenRight
                            }>
                                <p class="o-remove-margin">${
                                  rack.row1.drinks[0]
                                    ? rack.row1.drinks[0]
                                    : "Leeg"
                                }</p>
                                <div class="c-rack-row-icon">
                                <p class="o-remove-margin">${
                                  rack.row1.takenLeft + rack.row1.takenRight
                                }</p>
                                <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#00363F"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M6.5,10.5v1c0,0.43-0.28,0.81-0.7,0.94l-0.3,0.09l-0.3-0.09c-0.42-0.13-0.7-0.51-0.7-0.94v-1H6.5 M8,5H3v6.5 c0,1.12,0.74,2.05,1.75,2.37v2.63H3V18h5v-1.5H6.25v-2.63C7.26,13.55,8,12.62,8,11.5V5L8,5z M4.5,9V6.5h2V9H4.5L4.5,9z"/><path d="M16.5,11.5v2h-6l0-2H16.5 M14.5,2h-2c-0.55,0-1,0.45-1,1v2.98c0,0.61-0.37,1.17-0.94,1.39L9.94,7.62 C9.37,7.85,9,8.4,9,9.02v7.48c0,0.83,0.67,1.5,1.5,1.5h6c0.83,0,1.5-0.67,1.5-1.5V9.02c0-0.61-0.37-1.17-0.94-1.39l-0.61-0.25 C15.87,7.15,15.5,6.6,15.5,5.98V3C15.5,2.45,15.05,2,14.5,2L14.5,2z M13,4.5v-1h1v1H13L13,4.5z M10.5,10V9.02l0.61-0.25 C12.25,8.31,12.99,7.23,13,6h1c0.01,1.23,0.74,2.31,1.88,2.77l0.61,0.25V10H10.5L10.5,10z M10.5,16.5V15h6v1.5H10.5L10.5,16.5z"/></g></g></svg>
                                </div>
                            </div>
                          </div>
        `;
      } else {
        html += `
                          <div class="c-rack-row">
                            <div class="c-rack-row-item js-rack" data-total=${
                              rack.row1.takenLeft
                            }>
                                <p class="o-remove-margin">${
                                  rack.row1.drinks[0]
                                    ? rack.row1.drinks[0]
                                    : "Leeg"
                                }</p>
                                <div class="c-rack-row-icon">
                                <p class="o-remove-margin">${
                                  rack.row1.takenLeft
                                }</p>
                                
                                <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#00363F"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M6.5,10.5v1c0,0.43-0.28,0.81-0.7,0.94l-0.3,0.09l-0.3-0.09c-0.42-0.13-0.7-0.51-0.7-0.94v-1H6.5 M8,5H3v6.5 c0,1.12,0.74,2.05,1.75,2.37v2.63H3V18h5v-1.5H6.25v-2.63C7.26,13.55,8,12.62,8,11.5V5L8,5z M4.5,9V6.5h2V9H4.5L4.5,9z"/><path d="M16.5,11.5v2h-6l0-2H16.5 M14.5,2h-2c-0.55,0-1,0.45-1,1v2.98c0,0.61-0.37,1.17-0.94,1.39L9.94,7.62 C9.37,7.85,9,8.4,9,9.02v7.48c0,0.83,0.67,1.5,1.5,1.5h6c0.83,0,1.5-0.67,1.5-1.5V9.02c0-0.61-0.37-1.17-0.94-1.39l-0.61-0.25 C15.87,7.15,15.5,6.6,15.5,5.98V3C15.5,2.45,15.05,2,14.5,2L14.5,2z M13,4.5v-1h1v1H13L13,4.5z M10.5,10V9.02l0.61-0.25 C12.25,8.31,12.99,7.23,13,6h1c0.01,1.23,0.74,2.31,1.88,2.77l0.61,0.25V10H10.5L10.5,10z M10.5,16.5V15h6v1.5H10.5L10.5,16.5z"/></g></g></svg>
                                </div>
                            </div>
                            <div class="c-rack-row-item js-rack" data-total=${
                              rack.row1.takenRight
                            }>
                                <p class="o-remove-margin">${
                                  rack.row1.drinks[1]
                                    ? rack.row1.drinks[0]
                                    : "Leeg"
                                }</p>
                                <div class="c-rack-row-icon">
                                <p class="o-remove-margin">${
                                  rack.row1.takenRight
                                }</p>
                                <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#00363F"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M6.5,10.5v1c0,0.43-0.28,0.81-0.7,0.94l-0.3,0.09l-0.3-0.09c-0.42-0.13-0.7-0.51-0.7-0.94v-1H6.5 M8,5H3v6.5 c0,1.12,0.74,2.05,1.75,2.37v2.63H3V18h5v-1.5H6.25v-2.63C7.26,13.55,8,12.62,8,11.5V5L8,5z M4.5,9V6.5h2V9H4.5L4.5,9z"/><path d="M16.5,11.5v2h-6l0-2H16.5 M14.5,2h-2c-0.55,0-1,0.45-1,1v2.98c0,0.61-0.37,1.17-0.94,1.39L9.94,7.62 C9.37,7.85,9,8.4,9,9.02v7.48c0,0.83,0.67,1.5,1.5,1.5h6c0.83,0,1.5-0.67,1.5-1.5V9.02c0-0.61-0.37-1.17-0.94-1.39l-0.61-0.25 C15.87,7.15,15.5,6.6,15.5,5.98V3C15.5,2.45,15.05,2,14.5,2L14.5,2z M13,4.5v-1h1v1H13L13,4.5z M10.5,10V9.02l0.61-0.25 C12.25,8.31,12.99,7.23,13,6h1c0.01,1.23,0.74,2.31,1.88,2.77l0.61,0.25V10H10.5L10.5,10z M10.5,16.5V15h6v1.5H10.5L10.5,16.5z"/></g></g></svg>
                                </div>
                            </div>
                          </div>
        `;
      }
      if (rack.row2.drinks.length == 1) {
        html += `
        <div class="c-rack-row">
        <div class="c-rack-row-item js-rack" data-total=${
          rack.row2.takenLeft + rack.row2.takenRight
        }>
            <p class="o-remove-margin">${
              rack.row2.drinks[0] ? rack.row2.drinks[0] : "Leeg"
            }</p>
            <div class="c-rack-row-icon">
            <p class="o-remove-margin">${
              rack.row2.takenLeft + rack.row2.takenRight
            }</p>
            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#00363F"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M6.5,10.5v1c0,0.43-0.28,0.81-0.7,0.94l-0.3,0.09l-0.3-0.09c-0.42-0.13-0.7-0.51-0.7-0.94v-1H6.5 M8,5H3v6.5 c0,1.12,0.74,2.05,1.75,2.37v2.63H3V18h5v-1.5H6.25v-2.63C7.26,13.55,8,12.62,8,11.5V5L8,5z M4.5,9V6.5h2V9H4.5L4.5,9z"/><path d="M16.5,11.5v2h-6l0-2H16.5 M14.5,2h-2c-0.55,0-1,0.45-1,1v2.98c0,0.61-0.37,1.17-0.94,1.39L9.94,7.62 C9.37,7.85,9,8.4,9,9.02v7.48c0,0.83,0.67,1.5,1.5,1.5h6c0.83,0,1.5-0.67,1.5-1.5V9.02c0-0.61-0.37-1.17-0.94-1.39l-0.61-0.25 C15.87,7.15,15.5,6.6,15.5,5.98V3C15.5,2.45,15.05,2,14.5,2L14.5,2z M13,4.5v-1h1v1H13L13,4.5z M10.5,10V9.02l0.61-0.25 C12.25,8.31,12.99,7.23,13,6h1c0.01,1.23,0.74,2.31,1.88,2.77l0.61,0.25V10H10.5L10.5,10z M10.5,16.5V15h6v1.5H10.5L10.5,16.5z"/></g></g></svg>
            </div>
        </div>
      </div>
        `;
      } else {
        html += `
        <div class="c-rack-row">
        <div class="c-rack-row-item js-rack" data-total=${rack.row2.takenLeft}>
            <p class="o-remove-margin">${
              rack.row2.drinks[0] ? rack.row2.drinks[0] : "Leeg"
            }</p>
            <div class="c-rack-row-icon">
            <p class="o-remove-margin">${rack.row2.takenLeft}</p>
            
            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#00363F"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M6.5,10.5v1c0,0.43-0.28,0.81-0.7,0.94l-0.3,0.09l-0.3-0.09c-0.42-0.13-0.7-0.51-0.7-0.94v-1H6.5 M8,5H3v6.5 c0,1.12,0.74,2.05,1.75,2.37v2.63H3V18h5v-1.5H6.25v-2.63C7.26,13.55,8,12.62,8,11.5V5L8,5z M4.5,9V6.5h2V9H4.5L4.5,9z"/><path d="M16.5,11.5v2h-6l0-2H16.5 M14.5,2h-2c-0.55,0-1,0.45-1,1v2.98c0,0.61-0.37,1.17-0.94,1.39L9.94,7.62 C9.37,7.85,9,8.4,9,9.02v7.48c0,0.83,0.67,1.5,1.5,1.5h6c0.83,0,1.5-0.67,1.5-1.5V9.02c0-0.61-0.37-1.17-0.94-1.39l-0.61-0.25 C15.87,7.15,15.5,6.6,15.5,5.98V3C15.5,2.45,15.05,2,14.5,2L14.5,2z M13,4.5v-1h1v1H13L13,4.5z M10.5,10V9.02l0.61-0.25 C12.25,8.31,12.99,7.23,13,6h1c0.01,1.23,0.74,2.31,1.88,2.77l0.61,0.25V10H10.5L10.5,10z M10.5,16.5V15h6v1.5H10.5L10.5,16.5z"/></g></g></svg>
            </div>
        </div>
        <div class="c-rack-row-item js-rack" data-total=${rack.row2.takenRight}>
            <p class="o-remove-margin">${
              rack.row2.drinks[1] ? rack.row2.drinks[0] : "Leeg"
            }</p>
            <div class="c-rack-row-icon">
            <p class="o-remove-margin">${rack.row2.takenRight}</p>
            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#00363F"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M6.5,10.5v1c0,0.43-0.28,0.81-0.7,0.94l-0.3,0.09l-0.3-0.09c-0.42-0.13-0.7-0.51-0.7-0.94v-1H6.5 M8,5H3v6.5 c0,1.12,0.74,2.05,1.75,2.37v2.63H3V18h5v-1.5H6.25v-2.63C7.26,13.55,8,12.62,8,11.5V5L8,5z M4.5,9V6.5h2V9H4.5L4.5,9z"/><path d="M16.5,11.5v2h-6l0-2H16.5 M14.5,2h-2c-0.55,0-1,0.45-1,1v2.98c0,0.61-0.37,1.17-0.94,1.39L9.94,7.62 C9.37,7.85,9,8.4,9,9.02v7.48c0,0.83,0.67,1.5,1.5,1.5h6c0.83,0,1.5-0.67,1.5-1.5V9.02c0-0.61-0.37-1.17-0.94-1.39l-0.61-0.25 C15.87,7.15,15.5,6.6,15.5,5.98V3C15.5,2.45,15.05,2,14.5,2L14.5,2z M13,4.5v-1h1v1H13L13,4.5z M10.5,10V9.02l0.61-0.25 C12.25,8.31,12.99,7.23,13,6h1c0.01,1.23,0.74,2.31,1.88,2.77l0.61,0.25V10H10.5L10.5,10z M10.5,16.5V15h6v1.5H10.5L10.5,16.5z"/></g></g></svg>
            </div>
        </div>
      </div>
        `;
      }
      if (rack.row3.drinks.length == 1) {
        html += `
        <div class="c-rack-row">
        <div class="c-rack-row-item js-rack" data-total=${
          rack.row3.takenLeft + rack.row3.takenRight
        }>
            <p class="o-remove-margin">${
              rack.row3.drinks[0] ? rack.row3.drinks[0] : "Leeg"
            }</p>
            <div class="c-rack-row-icon">
            <p class="o-remove-margin">${
              rack.row3.takenLeft + rack.row3.takenRight
            }</p>
            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#00363F"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M6.5,10.5v1c0,0.43-0.28,0.81-0.7,0.94l-0.3,0.09l-0.3-0.09c-0.42-0.13-0.7-0.51-0.7-0.94v-1H6.5 M8,5H3v6.5 c0,1.12,0.74,2.05,1.75,2.37v2.63H3V18h5v-1.5H6.25v-2.63C7.26,13.55,8,12.62,8,11.5V5L8,5z M4.5,9V6.5h2V9H4.5L4.5,9z"/><path d="M16.5,11.5v2h-6l0-2H16.5 M14.5,2h-2c-0.55,0-1,0.45-1,1v2.98c0,0.61-0.37,1.17-0.94,1.39L9.94,7.62 C9.37,7.85,9,8.4,9,9.02v7.48c0,0.83,0.67,1.5,1.5,1.5h6c0.83,0,1.5-0.67,1.5-1.5V9.02c0-0.61-0.37-1.17-0.94-1.39l-0.61-0.25 C15.87,7.15,15.5,6.6,15.5,5.98V3C15.5,2.45,15.05,2,14.5,2L14.5,2z M13,4.5v-1h1v1H13L13,4.5z M10.5,10V9.02l0.61-0.25 C12.25,8.31,12.99,7.23,13,6h1c0.01,1.23,0.74,2.31,1.88,2.77l0.61,0.25V10H10.5L10.5,10z M10.5,16.5V15h6v1.5H10.5L10.5,16.5z"/></g></g></svg>
            </div>
        </div>
      </div>
        `;
      } else {
        html += `
        <div class="c-rack-row">
        <div class="c-rack-row-item js-rack" data-total=${rack.row3.takenLeft}>
            <p class="o-remove-margin">${
              rack.row3.drinks[0] ? rack.row3.drinks[0] : "Leeg"
            }</p>
            <div class="c-rack-row-icon">
            <p class="o-remove-margin">${rack.row3.takenLeft}</p>
            
            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#00363F"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M6.5,10.5v1c0,0.43-0.28,0.81-0.7,0.94l-0.3,0.09l-0.3-0.09c-0.42-0.13-0.7-0.51-0.7-0.94v-1H6.5 M8,5H3v6.5 c0,1.12,0.74,2.05,1.75,2.37v2.63H3V18h5v-1.5H6.25v-2.63C7.26,13.55,8,12.62,8,11.5V5L8,5z M4.5,9V6.5h2V9H4.5L4.5,9z"/><path d="M16.5,11.5v2h-6l0-2H16.5 M14.5,2h-2c-0.55,0-1,0.45-1,1v2.98c0,0.61-0.37,1.17-0.94,1.39L9.94,7.62 C9.37,7.85,9,8.4,9,9.02v7.48c0,0.83,0.67,1.5,1.5,1.5h6c0.83,0,1.5-0.67,1.5-1.5V9.02c0-0.61-0.37-1.17-0.94-1.39l-0.61-0.25 C15.87,7.15,15.5,6.6,15.5,5.98V3C15.5,2.45,15.05,2,14.5,2L14.5,2z M13,4.5v-1h1v1H13L13,4.5z M10.5,10V9.02l0.61-0.25 C12.25,8.31,12.99,7.23,13,6h1c0.01,1.23,0.74,2.31,1.88,2.77l0.61,0.25V10H10.5L10.5,10z M10.5,16.5V15h6v1.5H10.5L10.5,16.5z"/></g></g></svg>
            </div>
        </div>
        <div class="c-rack-row-item js-rack" data-total=${rack.row3.takenRight}>
            <p class="o-remove-margin">${
              rack.row3.drinks[1] ? rack.row3.drinks[0] : "Leeg"
            }</p>
            <div class="c-rack-row-icon">
            <p class="o-remove-margin">${rack.row3.takenRight}</p>
            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#00363F"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M6.5,10.5v1c0,0.43-0.28,0.81-0.7,0.94l-0.3,0.09l-0.3-0.09c-0.42-0.13-0.7-0.51-0.7-0.94v-1H6.5 M8,5H3v6.5 c0,1.12,0.74,2.05,1.75,2.37v2.63H3V18h5v-1.5H6.25v-2.63C7.26,13.55,8,12.62,8,11.5V5L8,5z M4.5,9V6.5h2V9H4.5L4.5,9z"/><path d="M16.5,11.5v2h-6l0-2H16.5 M14.5,2h-2c-0.55,0-1,0.45-1,1v2.98c0,0.61-0.37,1.17-0.94,1.39L9.94,7.62 C9.37,7.85,9,8.4,9,9.02v7.48c0,0.83,0.67,1.5,1.5,1.5h6c0.83,0,1.5-0.67,1.5-1.5V9.02c0-0.61-0.37-1.17-0.94-1.39l-0.61-0.25 C15.87,7.15,15.5,6.6,15.5,5.98V3C15.5,2.45,15.05,2,14.5,2L14.5,2z M13,4.5v-1h1v1H13L13,4.5z M10.5,10V9.02l0.61-0.25 C12.25,8.31,12.99,7.23,13,6h1c0.01,1.23,0.74,2.31,1.88,2.77l0.61,0.25V10H10.5L10.5,10z M10.5,16.5V15h6v1.5H10.5L10.5,16.5z"/></g></g></svg>
            </div>
        </div>
      </div>
        `;
      }
      if (rack.row4.drinks.length == 1) {
        html += `
        <div class="c-rack-row">
        <div class="c-rack-row-item js-rack" data-total=${
          rack.row4.takenLeft + rack.row4.takenRight
        }>
            <p class="o-remove-margin">${
              rack.row4.drinks[0] ? rack.row4.drinks[0] : "Leeg"
            }</p>
            <div class="c-rack-row-icon">
            <p class="o-remove-margin">${
              rack.row4.takenLeft + rack.row4.takenRight
            }</p>
            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#00363F"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M6.5,10.5v1c0,0.43-0.28,0.81-0.7,0.94l-0.3,0.09l-0.3-0.09c-0.42-0.13-0.7-0.51-0.7-0.94v-1H6.5 M8,5H3v6.5 c0,1.12,0.74,2.05,1.75,2.37v2.63H3V18h5v-1.5H6.25v-2.63C7.26,13.55,8,12.62,8,11.5V5L8,5z M4.5,9V6.5h2V9H4.5L4.5,9z"/><path d="M16.5,11.5v2h-6l0-2H16.5 M14.5,2h-2c-0.55,0-1,0.45-1,1v2.98c0,0.61-0.37,1.17-0.94,1.39L9.94,7.62 C9.37,7.85,9,8.4,9,9.02v7.48c0,0.83,0.67,1.5,1.5,1.5h6c0.83,0,1.5-0.67,1.5-1.5V9.02c0-0.61-0.37-1.17-0.94-1.39l-0.61-0.25 C15.87,7.15,15.5,6.6,15.5,5.98V3C15.5,2.45,15.05,2,14.5,2L14.5,2z M13,4.5v-1h1v1H13L13,4.5z M10.5,10V9.02l0.61-0.25 C12.25,8.31,12.99,7.23,13,6h1c0.01,1.23,0.74,2.31,1.88,2.77l0.61,0.25V10H10.5L10.5,10z M10.5,16.5V15h6v1.5H10.5L10.5,16.5z"/></g></g></svg>
            </div>
        </div>
      </div>
        `;
      } else {
        html += `
        <div class="c-rack-row">
        <div class="c-rack-row-item js-rack" data-total=${rack.row4.takenLeft}>
            <p class="o-remove-margin">${
              rack.row4.drinks[0] ? rack.row4.drinks[0] : "Leeg"
            }</p>
            <div class="c-rack-row-icon">
            <p class="o-remove-margin">${rack.row4.takenLeft}</p>
            
            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#00363F"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M6.5,10.5v1c0,0.43-0.28,0.81-0.7,0.94l-0.3,0.09l-0.3-0.09c-0.42-0.13-0.7-0.51-0.7-0.94v-1H6.5 M8,5H3v6.5 c0,1.12,0.74,2.05,1.75,2.37v2.63H3V18h5v-1.5H6.25v-2.63C7.26,13.55,8,12.62,8,11.5V5L8,5z M4.5,9V6.5h2V9H4.5L4.5,9z"/><path d="M16.5,11.5v2h-6l0-2H16.5 M14.5,2h-2c-0.55,0-1,0.45-1,1v2.98c0,0.61-0.37,1.17-0.94,1.39L9.94,7.62 C9.37,7.85,9,8.4,9,9.02v7.48c0,0.83,0.67,1.5,1.5,1.5h6c0.83,0,1.5-0.67,1.5-1.5V9.02c0-0.61-0.37-1.17-0.94-1.39l-0.61-0.25 C15.87,7.15,15.5,6.6,15.5,5.98V3C15.5,2.45,15.05,2,14.5,2L14.5,2z M13,4.5v-1h1v1H13L13,4.5z M10.5,10V9.02l0.61-0.25 C12.25,8.31,12.99,7.23,13,6h1c0.01,1.23,0.74,2.31,1.88,2.77l0.61,0.25V10H10.5L10.5,10z M10.5,16.5V15h6v1.5H10.5L10.5,16.5z"/></g></g></svg>
            </div>
        </div>
        <div class="c-rack-row-item js-rack" data-total=${rack.row4.takenRight}>
            <p class="o-remove-margin">${
              rack.row4.drinks[1] ? rack.row4.drinks[0] : "Leeg"
            }</p>
            <div class="c-rack-row-icon">
            <p class="o-remove-margin">${rack.row4.takenRight}</p>
            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="18px" viewBox="0 0 20 20" width="18px" fill="#00363F"><g><rect fill="none" height="20" width="20" y="0"/></g><g><g><path d="M6.5,10.5v1c0,0.43-0.28,0.81-0.7,0.94l-0.3,0.09l-0.3-0.09c-0.42-0.13-0.7-0.51-0.7-0.94v-1H6.5 M8,5H3v6.5 c0,1.12,0.74,2.05,1.75,2.37v2.63H3V18h5v-1.5H6.25v-2.63C7.26,13.55,8,12.62,8,11.5V5L8,5z M4.5,9V6.5h2V9H4.5L4.5,9z"/><path d="M16.5,11.5v2h-6l0-2H16.5 M14.5,2h-2c-0.55,0-1,0.45-1,1v2.98c0,0.61-0.37,1.17-0.94,1.39L9.94,7.62 C9.37,7.85,9,8.4,9,9.02v7.48c0,0.83,0.67,1.5,1.5,1.5h6c0.83,0,1.5-0.67,1.5-1.5V9.02c0-0.61-0.37-1.17-0.94-1.39l-0.61-0.25 C15.87,7.15,15.5,6.6,15.5,5.98V3C15.5,2.45,15.05,2,14.5,2L14.5,2z M13,4.5v-1h1v1H13L13,4.5z M10.5,10V9.02l0.61-0.25 C12.25,8.31,12.99,7.23,13,6h1c0.01,1.23,0.74,2.31,1.88,2.77l0.61,0.25V10H10.5L10.5,10z M10.5,16.5V15h6v1.5H10.5L10.5,16.5z"/></g></g></svg>
            </div>
        </div>
      </div>
        `;
      }
      html += `</div>`;
    }
    htmlRacks.innerHTML = html;
    showUnavailableRacks();
  } else {
    let arr = customerList.filter(function (elem) {
      return elem.customerId == selectedCustomer;
    });
    htmlTitle.innerHTML = `${arr[0].name}`;
    htmlRacks.innerHTML = `Geen rekken beschikbaar`;
  }
};

const showUnavailableRacks = function () {
  for (let item of document.querySelectorAll(".js-rack")) {
    if (item.getAttribute("data-total") >= treshhold) {
      item.classList.add("c-rack-row-item_unavailable");
    }
  }
};
//#endregion

//#region ***  Callback-No Visualisation - callback___  ***********
const callbackError = function (jsonObject) {
  console.log(jsonObject);
};

const callbackCustomers = function (jsonObject) {
  for (let customer of jsonObject) {
    getTotalPredictions(customer.Id, customer.Name);
  }
};

const callbackTotalPredictions = function (jsonObject) {
  customerList.push(jsonObject);
  if (customerList.length == customers.length) {
    customerList.sort(function (first, second) {
      return second.total - first.total;
    });
    showCustomers();
  }
};

const callbackGetSelectedCustomer = function () {
  let allCustomerBtns = document.querySelectorAll(".js-customer-button");
  allCustomerBtns[customerCounter].classList.add("c-customer-button_selected");
  let customerId =
    allCustomerBtns[customerCounter].getAttribute("data-customerId");
  previousCustomer = allCustomerBtns[customerCounter];
  selectedCustomer = customerId;
  getPredictionsCustomer(customerId);
};

//#endregion

//#region ***  Data Access - get___                     ***********
const getCustomers = function () {
  //In realiteit spreek je de klantendatabase aan
  customers = [
    { Name: "daan", Id: "1" },
    { Name: "alec", Id: "2" },
    { Name: "dominic", Id: "3" },
  ];
  callbackCustomers(customers);
};

const getTotalPredictions = function (customerId, name) {
  let url = `${baseUrl}/totalpredictions`;
  const body = JSON.stringify({
    CustomerId: customerId,
    Name: name,
  });
  handleData(url, callbackTotalPredictions, callbackError, "POST", body);
};

const getPredictionsCustomer = function (customerId) {
  let url = `${baseUrl}/predictions/${customerId}`;
  handleData(url, showSelectedCustomer, callbackError, "GET");
};
//#endregion

//#region ***  Event Listeners - listenTo___            ***********
const listenToSortButton = function () {
  htmlSortButton.addEventListener("click", function () {
    htmlSortButton.classList.toggle("c-title-left_arrow-flip");
    customerList.reverse();
    htmlCustomerSearch.value = "";
    customerCounter = 0;
    showCustomers();
  });
};

const listenToCustomerSearch = function () {
  htmlCustomerSearch.addEventListener("input", function () {
    let arr = customerList.filter(function (elem) {
      return (
        elem.name.includes(htmlCustomerSearch.value.toLowerCase()) ||
        elem.customerId.includes(htmlCustomerSearch.value.toLowerCase())
      );
    });
    showFilteredCustomers(arr);
  });
};

const listenToCustomerButton = function () {
  for (const b of document.querySelectorAll(".js-customer-button")) {
    b.addEventListener("click", function () {
      previousCustomer.classList.remove("c-customer-button_selected");
      this.classList.add("c-customer-button_selected");
      let customerId = this.getAttribute("data-customerId");
      previousCustomer = this;
      selectedCustomer = customerId;
      getPredictionsCustomer(customerId);
    });
  }
};

const listenToNext = function () {
  htmlNext.addEventListener("click", function () {
    customerCounter++;
    if (customerCounter > customerList.length - 1) {
      customerCounter = 0;
    }
    previousCustomer.classList.remove("c-customer-button_selected");
    callbackGetSelectedCustomer();
  });
};

const listenToPrevious = function () {
  htmlPrevious.addEventListener("click", function () {
    customerCounter--;
    if (customerCounter < 0) {
      customerCounter = customerList.length - 1;
    }
    previousCustomer.classList.remove("c-customer-button_selected");
    callbackGetSelectedCustomer();
  });
};
// Event listeners

//#region ***  Init / DOMContentLoaded                  ***********
const init = function () {
  console.log("DOM Content Loaded.");
  htmlCustomerList = document.querySelector(".js-customer-list");
  htmlSortButton = document.querySelector(".js-sort-button");
  htmlCustomerSearch = document.querySelector(".js-search");
  htmlTitle = document.querySelector(".js-title");
  htmlRacks = document.querySelector(".js-racks");
  htmlNext = document.querySelector(".js-next");
  htmlPrevious = document.querySelector(".js-previous");

  getCustomers();

  listenToSortButton();
  listenToCustomerSearch();
  listenToNext();
  listenToPrevious();
};

document.addEventListener("DOMContentLoaded", init);
//#endregion
