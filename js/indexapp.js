"use strict";
let baseUrl =
  "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io";
let customerList = [];
let customers;
let previousCustomer;
const treshhold = 1;

//#region ***  DOM references                           ***********
let htmlCustomerList, htmlSortButton, htmlCustomerSearch, htmlTitle, htmlRacks;

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
                                }</p>
                                <p class="o-remove-margin">${
                                  rack.row1.takenLeft + rack.row1.takenRight
                                }</p>
                            </div>
                          </div>
        `;
      } else {
        html += `
                          <div class="c-rack-row">
                            <div class="c-rack-row-item js-rack" data-total=${rack.row1.takenLeft}>
                                <p class="o-remove-margin">${rack.row1.drinks[0]}</p>
                                <p class="o-remove-margin">${rack.row1.takenLeft}</p>
                            </div>
                            <div class="c-rack-row-item js-rack" data-total=${rack.row1.takenRight}>
                                <p class="o-remove-margin">${rack.row1.drinks[1]}</p>
                                <p class="o-remove-margin">${rack.row1.takenRight}</p>
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
                                  rack.row2.drinks[0]
                                }</p>
                                <p class="o-remove-margin">${
                                  rack.row2.takenLeft + rack.row2.takenRight
                                }</p>
                            </div>
                          </div>
        `;
      } else {
        html += `
                          <div class="c-rack-row">
                            <div class="c-rack-row-item js-rack" data-total=${rack.row2.takenLeft}>
                                <p class="o-remove-margin">${rack.row2.drinks[0]}</p>
                                <p class="o-remove-margin">${rack.row2.takenLeft}</p>
                            </div>
                            <div class="c-rack-row-item js-rack" data-total=${rack.row2.takenRight}>
                                <p class="o-remove-margin">${rack.row2.drinks[1]}</p>
                                <p class="o-remove-margin">${rack.row2.takenRight}</p>
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
                                  rack.row3.drinks[0]
                                }</p>
                                <p class="o-remove-margin">${
                                  rack.row3.takenLeft + rack.row3.takenRight
                                }</p>
                            </div>
                          </div>
        `;
      } else {
        html += `
                          <div class="c-rack-row">
                            <div class="c-rack-row-item js-rack" data-total=${rack.row3.takenLeft}>
                                <p class="o-remove-margin">${rack.row3.drinks[0]}</p>
                                <p class="o-remove-margin">${rack.row3.takenLeft}</p>
                            </div>
                            <div class="c-rack-row-item js-rack" data-total=${rack.row3.takenRight}>
                                <p class="o-remove-margin">${rack.row3.drinks[1]}</p>
                                <p class="o-remove-margin">${rack.row3.takenRight}</p>
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
                                  rack.row4.drinks[0]
                                }</p>
                                <p class="o-remove-margin">${
                                  rack.row4.takenLeft + rack.row4.takenRight
                                }</p>
                            </div>
                          </div>
        `;
      } else {
        html += `
                          <div class="c-rack-row">
                            <div class="c-rack-row-item js-rack" data-total=${rack.row4.takenLeft}>
                                <p class="o-remove-margin">${rack.row4.drinks[0]}</p>
                                <p class="o-remove-margin">${rack.row4.takenLeft}</p>
                            </div>
                            <div class="c-rack-row-item js-rack" data-total=${rack.row4.takenRight}>
                                <p class="o-remove-margin">${rack.row4.drinks[1]}</p>
                                <p class="o-remove-margin">${rack.row4.takenRight}</p>
                            </div>
                          </div>
        `;
      }
      html += `</div>`;
    }
    htmlRacks.innerHTML = html;
    showUnavailableRacks();
  } else {
    htmlTitle.innerHTML = `Geen rekken`;
    htmlRacks.innerHTML = ``;
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
  allCustomerBtns[0].classList.add("c-customer-button_selected");
  let customerId = allCustomerBtns[0].getAttribute("data-customerId");
  previousCustomer = allCustomerBtns[0];
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
      getPredictionsCustomer(customerId);
    });
  }
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

  getCustomers();

  listenToSortButton();
  listenToCustomerSearch();
};

document.addEventListener("DOMContentLoaded", init);
//#endregion
