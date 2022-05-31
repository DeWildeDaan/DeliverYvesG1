"use strict";
let baseUrl =
  "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io";
let customerList = [];
let customers;
let previousCustomer;

//#region ***  DOM references                           ***********
let htmlCustomerList, htmlSortButton, htmlCustomerSearch;

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
  showSelectedCustomer();
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

const showSelectedCustomer = function () {
  let allCustomerBtns = document.querySelectorAll(".js-customer-button");
  allCustomerBtns[0].classList.add("c-customer-button_selected");
  previousCustomer = allCustomerBtns[0];
};
//#endregion

//#region ***  Callback-No Visualisation - callback___  ***********
const callbackError = function (jsonObject) {
  console.log(jsonObject);
};

const callbackCustomers = function (jsonObject) {
  for (let customer of jsonObject) {
    callbackGetTotalPredictions(customer.Id, customer.Name);
  }
};

const callbackGetTotalPredictions = function (customerId, name) {
  let url = `${baseUrl}/totalpredictions`;
  const body = JSON.stringify({
    CustomerId: customerId,
    Name: name,
  });
  handleData(url, callbackTotalPredictions, callbackError, "POST", body);
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

const callbackSortCustomers = function () {};

//#endregion

//#region ***  Data Access - get___                     ***********
const getCustomers = function () {
  //In realiteit spreek je de klantendatabase aan
  customers = [
    { Name: "daan", Id: "1" },
    { Name: "alec", Id: "2" },
  ];
  callbackCustomers(customers);
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

  getCustomers();

  listenToSortButton();
  listenToCustomerSearch();
};

document.addEventListener("DOMContentLoaded", init);
//#endregion
