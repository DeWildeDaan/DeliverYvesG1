"use strict";
let baseUrl =
  "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io";

//#region ***  DOM references                           ***********
let customerList;
let customers;
//#endregion

//#region ***  Callback-Visualisation - show___         ***********
const showCustomers = function (jsonObject) {
  let html = "";
  console.log(customerList.innerHTML);
  for (let customer of customers) {
    console.log(customer);
  }
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
  customers = [
    { Naam: "Daan", Id: 1 },
    { Naam: "Alec", Id: 2 },
    { Naam: "Dominic", Id: 3 },
  ];
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
