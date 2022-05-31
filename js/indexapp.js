"use strict";
let baseUrl =
  "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io";

//#region ***  DOM references                           ***********
let customerList;
//#endregion

//#region ***  Callback-Visualisation - show___         ***********
const showCustomers = function () {
  let html = customerList.innerHTML;
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
    customer["TotalPredictions"] = getPredictionsCustomer(customer.Id);
  }
};

const callbackTotalPredictions = function (jsonObject) {
  console.log(jsonObject);
};

//#endregion

//#region ***  Data Access - get___                     ***********
const getCustomers = function () {
  //In realiteit spreek je de klantendatabase aan
  let customers = [
    { Name: "Daan", Id: "1" },
    { Name: "Alec", Id: "2" },
  ];
  callbackCustomers(customers);
};

const getPredictionsCustomer = function (customerId) {
  let url = `${baseUrl}/totalpredictions/${customerId}`;
  handleData(url, callbackTotalPredictions, callbackError);
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
