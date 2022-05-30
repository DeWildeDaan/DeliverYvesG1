"use strict";
let baseUrl =
  "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io";

//#region ***  DOM references                           ***********
let customerList;
let customers;
//#endregion

//#region ***  Callback-Visualisation - show___         ***********
const showCustomers = function (jsonObject) {
  let html = customerList.innerHTML;
  let total = 0;
  var name = "";
  for (let customer of customers) {
    if (customer.Id == jsonObject[0].customerId) {
      name = customer.Name;
      console.log(name);
    }
  }
  for (let rack of jsonObject) {
    console.log(rack);
    total = total + rack.total;
  }
  html += `
                        <button class="o-button-reset c-customer-button">
                            <p class="o-remove-margin">${name}</p>
                            <p class="o-remove-margin">${total}</p>
                        </button>
  `;
  customerList.innerHTML = html;
};
//#endregion

//#region ***  Callback-No Visualisation - callback___  ***********
const callbackError = function (jsonObject) {
  console.log(jsonObject);
};

const callbackCustomers = function (jsonObject) {
  for (let customer of jsonObject) {
    getDataCustomer(customer.Id);
  }
};
//#endregion

//#region ***  Data Access - get___                     ***********
const getCustomers = function () {
  //In realiteit spreek je de klantendatabase aan
  customers = [{ Name: "Daan", Id: "1" }];
  callbackCustomers(customers);
};

const getDataCustomer = function (customerId) {
  let url = `${baseUrl}/predictions/${customerId}`;
  handleData(url, showCustomers, callbackError, "GET");
};
//#endregion

//#region ***  Event Listeners - listenTo___            ***********
// Event listeners

//#region ***  Init / DOMContentLoaded                  ***********
const init = function () {
  console.log("DOM Content Loaded.");
  customerList = document.querySelector(".js-customer-list");

  getCustomers();
};

document.addEventListener("DOMContentLoaded", init);
//#endregion
