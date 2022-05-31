"use strict";
let baseUrl =
  "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io";
let customers;

//#region ***  DOM references                           ***********
let htmlEmptyRacks;
//#endregion

//#region ***  Callback-Visualisation - show___         ***********
const showEmptyRacks = function (jsonObject) {
  console.log(jsonObject);
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
    console.log(jsonObject);
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
                                    onkeyup="filterFunction()">
                                <div class='js-dropdown-customers'>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <button class="o-button-reset c-manage-button">
                            <svg id="save_black_24dp" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24">

                                <path id="Path_3155" data-name="Path 3155"
                                    d="M17,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2.006,2.006,0,0,0,2-2V7Zm2,16H5V5H16.17L19,7.83Zm-7-7a3,3,0,1,0,3,3A3,3,0,0,0,12,12ZM6,6h9v4H6Z"
                                    fill="#0084a4" />
                            </svg>
                        </button>
                    </td>
                </tr>
        `;
    }
    html += `</table>`;
    htmlEmptyRacks.innerHTML = html;
    listenToChooseCustomerButton();
  }
};

const showDropdown = function (rackId) {
  document
    .querySelector(`.js-dropdown-${rackId}`)
    .classList.toggle("c-dropdown-show");
  showDropdownCustomers(customers);
};

const showDropdownCustomers = function (arrcustomers) {
  for (const b of document.querySelectorAll(".js-dropdown-customers")) {
    let html = ``;
    for (let customer of arrcustomers) {
      html += `<button class="c-dropdown-content-button o-button-reset" data-customerId=${customer.Id}>${customer.Name}</button>`;
    }
    b.innerHTML = html;
  }
};
//#endregion

//#region ***  Callback-No Visualisation - callback___  ***********
const callbackError = function (jsonObject) {
  console.log(jsonObject);
};

const callbackCustomersManage = function (jsonObject) {
    customers = jsonObject;
};
//#endregion

//#region ***  Data Access - get___                     ***********
const getCustomersManage = function () {
  //In realiteit spreek je de klantendatabase aan
  let customers = [
    { Name: "daan", Id: "1" },
    { Name: "alec", Id: "2" },
  ];
  callbackCustomersManage(customers);
};

const getEmptyRacks = function () {
  let url = `${baseUrl}/nocustomer`;
  handleData(url, showEmptyRacks, callbackError, "GET");
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
// Event listeners

//#region ***  Init / DOMContentLoaded                  ***********
const init = function () {
  console.log("DOM Content Loaded.");
  htmlEmptyRacks = document.querySelector(".js-new-racks");

  getEmptyRacks();
  getCustomersManage();
};

document.addEventListener("DOMContentLoaded", init);
//#endregion
