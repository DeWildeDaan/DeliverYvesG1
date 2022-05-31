"use strict";
let baseUrl =
  "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io";
let customerList;

//#region ***  DOM references                           ***********
let htmlEmptyRacks, htmlRacks;
//#endregion

//#region ***  Callback-Visualisation - show___         ***********
const showEmptyRacks = function (jsonObject) {
  if (jsonObject[0]) {
    let html = `
    <div class="c-title-main-manage">
        <p class="o-remove-margin">Nieuwe rekken</p>
    </div>
    <table>
        <tr>
            <th>
                <p class="o-remove-margin c-title-manage">Rek id</p>

            </th>
            <th>
                <p class="o-remove-margin c-title-manage">Klant</p>
            </th>
        </tr>
    `;
    for (let rack of jsonObject) {
      html += `
        <tr>
                    <td>
                        <p class="o-remove-margin">${rack.RackId}</p>
                    </td>
                    <td>
                        <div class="c-dropdown">
                            <button class="js-choose-customer o-button-reset c-new-customer-btn" data-rackId=${rack.RackId}>Kies een klant</button>
                            <div class="c-dropdown-content js-dropdown-${rack.RackId}">
                                <input class="c-dropdown-input js-dropdown-search" type="text" placeholder="Search.."
                                    >
                                <div class='js-dropdown-customers' data-rackId=${rack.RackId}>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
        `;
    }
    html += `</table>`;
    htmlEmptyRacks.innerHTML = html;
    listenToChooseCustomerButton();
    listenToDropdownSearch();
  } else {
    htmlEmptyRacks.innerHTML = "";
  }
  getRacks();
};

const showDropdown = function (rackId) {
  document
    .querySelector(`.js-dropdown-${rackId}`)
    .classList.toggle("c-dropdown-show");
  showDropdownCustomers(customerList);
};

const showDropdownCustomers = function (arrcustomers) {
  for (const b of document.querySelectorAll(".js-dropdown-customers")) {
    let html = ``;
    let rackId = b.getAttribute("data-rackId");
    for (let customer of arrcustomers) {
      html += `<button class="c-dropdown-content-button o-button-reset js-dropdown-customer-btn" data-rackId=${rackId} data-customerId=${customer.Id}>${customer.Name}</button>`;
    }
    b.innerHTML = html;
  }
  listenToDropdownCustomerBtn();
};

const showRacks = function (jsonObject) {
  let html = `
            <div class="c-title-main-manage">
                <p class="o-remove-margin">Rekken</p>
            </div>
            <table>
                <tr>
                    <th>
                        <p class="o-remove-margin c-title-manage">Rek id</p>

                    </th>
                    <th>
                        <p class="o-remove-margin c-title-manage">Klant</p>
                    </th>
                    <th>
                        <p class="o-remove-margin c-title-manage">Rij 1</p>

                    </th>
                    <th>
                        <p class="o-remove-margin c-title-manage">Rij 2</p>
                    </th>
                    <th>
                        <p class="o-remove-margin c-title-manage">Rij 3</p>

                    </th>
                    <th>
                        <p class="o-remove-margin c-title-manage">Rij 4</p>
                    </th>
                </tr>
  `;
  for (let rack of jsonObject) {
    let arr = customerList.filter(function (elem) {
      return elem.Id == rack.customerId;
    });
    html += `
    <tr>
                    <td>
                        <p class="o-remove-margin">${rack.rackId}</p>
                    </td>
                    <td>
                        <p class="o-remove-margin">${arr[0].Name}</p>
                    </td>
                    <td>
                        <input type="text" class="c-manage-input js-input js-row1-${rack.rackId.replaceAll(
                          ":",
                          "-"
                        )}" value="${rack.row1}">
                    </td>
                    <td>
                        <input type="text" class="c-manage-input js-input js-row2-${rack.rackId.replaceAll(
                          ":",
                          "-"
                        )}" value="${rack.row2}">
                    </td>
                    <td>
                        <input type="text" class="c-manage-input js-input js-row3-${rack.rackId.replaceAll(
                          ":",
                          "-"
                        )}" value="${rack.row3}">
                    </td>
                    <td>
                        <input type="text" class="c-manage-input js-input js-row4-${rack.rackId.replaceAll(
                          ":",
                          "-"
                        )}" value="${rack.row4}">
                    </td>
                    <td>
                        <button class="o-button-reset c-manage-button js-save-rack-button" data-rackId=${rack.rackId} data-customerId=${rack.customerId}>
                          <svg id="save_black_24dp" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                          <path id="Path_3154" data-name="Path 3154" d="M0,0H24V24H0Z" fill="none"/>
                          <path id="Path_3155" data-name="Path 3155" d="M17,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2.006,2.006,0,0,0,2-2V7Zm2,16H5V5H16.17L19,7.83Zm-7-7a3,3,0,1,0,3,3A3,3,0,0,0,12,12ZM6,6h9v4H6Z" fill="#0084a4"/>
                          </svg>
                        </button>
                    </td>
                    <td>
                        <button class="o-button-reset c-manage-button js-delete-rack-button" data-rackId=${
                          rack.rackId
                        }>
                            <svg id="delete_black_24dp" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24">
                                <path id="Path_3150" data-name="Path 3150" d="M0,0H24V24H0Z" fill="none" />
                                <path id="Path_3151" data-name="Path 3151"
                                    d="M16,9V19H8V9h8M14.5,3h-5l-1,1H5V6H19V4H15.5ZM18,7H6V19a2.006,2.006,0,0,0,2,2h8a2.006,2.006,0,0,0,2-2Z"
                                    fill="#0084a4" />
                            </svg>
                        </button>
                    </td>
                </tr>
    `;
  }
  html += `</table>`;
  htmlRacks.innerHTML = html;
  listenToSaveButton();
  listenToDeleteButton();
};

//#endregion

//#region ***  Callback-No Visualisation - callback___  ***********
const callbackError = function (jsonObject) {
  console.log(jsonObject);
};

const callbackCustomersManage = function (jsonObject) {
  customerList = jsonObject;
};

const callbackPostCustomerId = function (rackId, customerId) {
  let url = `${baseUrl}/racks`;
  const body = JSON.stringify({
    RackId: rackId,
    CustomerId: customerId,
  });
  handleData(url, getEmptyRacks, callbackError, "PUT", body);
};

const callbackPutRack = function (rackId, customerId) {
  let row1 = document
    .querySelector(`.js-row1-${rackId.replaceAll(":", "-")}`)
    .value.split(",");
  let row2 = document
    .querySelector(`.js-row2-${rackId.replaceAll(":", "-")}`)
    .value.split(",");
  let row3 = document
    .querySelector(`.js-row3-${rackId.replaceAll(":", "-")}`)
    .value.split(",");
  let row4 = document
    .querySelector(`.js-row4-${rackId.replaceAll(":", "-")}`)
    .value.split(",");
  let url = `${baseUrl}/racks`;
  const body = JSON.stringify({
    RackId: rackId,
    CustomerId: customerId,
    Row1: row1,
    Row2: row2,
    Row3: row3,
    Row4: row4
  });
  handleData(url, getRacks, callbackError, "PUT", body);
};

const callbackDeleteRack = function (rackId) {
  let url = `${baseUrl}/racks/${rackId}`;
  handleData(url, getRacks, callbackError, "DELETE");
};
//#endregion

//#region ***  Data Access - get___                     ***********
const getCustomersManage = function () {
  //In realiteit spreek je de klantendatabase aan
  let customers = [
    { Name: "daan", Id: "1" },
    { Name: "alec", Id: "2" },
    { Name: "dominic", Id: "3" },
  ];
  callbackCustomersManage(customers);
};

const getEmptyRacks = function () {
  let url = `${baseUrl}/nocustomer`;
  handleData(url, showEmptyRacks, callbackError, "GET");
};

const getRacks = function () {
  let url = `${baseUrl}/racks`;
  handleData(url, showRacks, callbackError, "GET");
};
//#endregion

//#region ***  Event Listeners - listenTo___            ***********
const listenToChooseCustomerButton = function () {
  for (const b of document.querySelectorAll(".js-choose-customer")) {
    b.addEventListener("click", function () {
      let rackId = this.getAttribute("data-rackId");
      showDropdown(rackId);
    });
  }
};

const listenToDropdownSearch = function () {
  for (const b of document.querySelectorAll(".js-dropdown-search")) {
    b.addEventListener("input", function () {
      let arr = customerList.filter(function (elem) {
        return (
          elem.Name.includes(b.value.toLowerCase()) ||
          elem.Id.includes(b.value.toLowerCase())
        );
      });
      showDropdownCustomers(arr);
    });
  }
};

const listenToDropdownCustomerBtn = function () {
  for (const b of document.querySelectorAll(".js-dropdown-customer-btn")) {
    b.addEventListener("click", function () {
      let rackId = b.getAttribute("data-rackId");
      let customerId = b.getAttribute("data-customerId");
      callbackPostCustomerId(rackId, customerId);
      getRacks();
    });
  }
};

const listenToSaveButton = function () {
  for (const b of document.querySelectorAll(".js-save-rack-button")) {
    b.addEventListener("click", function () {
      let rackId = this.getAttribute("data-rackId");
      let customerId = this.getAttribute("data-customerId");
      callbackPutRack(rackId, customerId);
    });
  }
};

const listenToDeleteButton = function () {
  for (const b of document.querySelectorAll(".js-delete-rack-button")) {
    b.addEventListener("click", function () {
      let rackId = this.getAttribute("data-rackId");
      callbackDeleteRack(rackId);
    });
  }
};
// Event listeners

//#region ***  Init / DOMContentLoaded                  ***********
const init = function () {
  console.log("DOM Content Loaded.");
  htmlEmptyRacks = document.querySelector(".js-new-racks");
  htmlRacks = document.querySelector(".js-racks");

  getCustomersManage();
  getEmptyRacks();
};

document.addEventListener("DOMContentLoaded", init);
//#endregion
