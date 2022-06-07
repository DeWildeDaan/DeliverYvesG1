"use strict";
let baseUrl =
  "https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io";
let customerList, customerRacks;
let selectedRacks = [];
const messageDisplayTime = 5000; //Milliseconds

//#region ***  DOM references                           ***********
let htmlEmptyRacks,
  htmlRacks,
  htmlCustomerSearch,
  htmlDeleteButton,
  htmlMessage,
  htmlMessageText;
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
                            <button class="js-choose-customer o-button-reset c-new-customer-btn" data-rackId=${rack.RackId}>
                            Kies een klant
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFF9F4"><path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/></svg>
                            </button>
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

const showDropdownCustomers = function (arrCustomers) {
  for (const b of document.querySelectorAll(".js-dropdown-customers")) {
    let html = ``;
    let rackId = b.getAttribute("data-rackId");
    for (let customer of arrCustomers) {
      html += `<button class="c-dropdown-content-button o-button-reset js-dropdown-customer-btn" data-rackId=${rackId} data-customerId=${customer.Id}>${customer.Name}</button>`;
    }
    b.innerHTML = html;
  }
  listenToDropdownCustomerBtn();
};

const showRacks = function (arrRacks) {
  let html = `
            <div class="c-title-main-manage">
                <p class="o-remove-margin">Rekken</p>
            </div>
            <table>
                <tr>
                    <th>
                      <button class="o-button-reset c-manage-button js-delete-button" disabled>
                          <svg id="delete_black_24dp" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                              viewBox="0 0 24 24">
                              <path id="Path_3150" data-name="Path 3150" d="M0,0H24V24H0Z" fill="none" />
                              <path id="Path_3151" data-name="Path 3151"
                                  d="M16,9V19H8V9h8M14.5,3h-5l-1,1H5V6H19V4H15.5ZM18,7H6V19a2.006,2.006,0,0,0,2,2h8a2.006,2.006,0,0,0,2-2Z"
                                  fill="#5E5A59" />
                          </svg>
                      </button>
                    </th>
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
                    <th>&nbsp</th>
                </tr>
  `;
  for (let rack of arrRacks) {
    let arr = customerList.filter(function (elem) {
      return elem.Id == rack.customerId;
    });
    html += `
    <tr>
                    <td>
                        <input class="js-chekcbox o-hide-accessible c-option c-option--hidden" type="checkbox" id="checkbox${
                          rack.rackId
                        }" data-rackId=${rack.rackId}>
                        <label class="c-label c-label--option c-custom-option" for="checkbox${
                          rack.rackId
                        }">
                            <span class="c-custom-option__fake-input c-custom-option__fake-input--checkbox">
                                <svg class="c-custom-option__symbol" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 9 6.75">
                                    <path
                                        d="M4.75,9.5a1,1,0,0,1-.707-.293l-2.25-2.25A1,1,0,1,1,3.207,5.543L4.75,7.086,8.793,3.043a1,1,0,0,1,1.414,1.414l-4.75,4.75A1,1,0,0,1,4.75,9.5"
                                        transform="translate(-1.5 -2.75)" />
                                </svg>
                            </span>
                        </label>
                    </td>
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
                        <button class="o-button-reset c-manage-button js-save-rack-button" data-rackId=${
                          rack.rackId
                        } data-customerId=${rack.customerId}>
                          <svg id="save_black_24dp" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                          <path id="Path_3154" data-name="Path 3154" d="M0,0H24V24H0Z" fill="none"/>
                          <path id="Path_3155" data-name="Path 3155" d="M17,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2.006,2.006,0,0,0,2-2V7Zm2,16H5V5H16.17L19,7.83Zm-7-7a3,3,0,1,0,3,3A3,3,0,0,0,12,12ZM6,6h9v4H6Z" fill="#0084a4"/>
                          </svg>
                        </button>
                    </td>
                    
                </tr>
    `;
  }
  html += `</table>`;
  htmlRacks.innerHTML = html;

  htmlDeleteButton = document.querySelector(".js-delete-button");
  listenToSaveButton();
  listenToDeleteButton();
  listenToCheckBox();
};

const showFilteredRacks = function (arrCustomers) {
  let arrRacks = [];
  let arrCustomerIds = [];
  for (let customer of arrCustomers) {
    arrCustomerIds.push(customer.Id);
  }
  for (let rack of customerRacks) {
    if (arrCustomerIds.includes(rack.customerId)) {
      arrRacks.push(rack);
    }
  }
  showRacks(arrRacks);
};

const showMessage = function (text) {
  htmlMessageText.innerHTML = text;
  htmlMessage.classList.add("active");

  setTimeout(function () {
    htmlMessage.classList.remove("active");
  }, messageDisplayTime);
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
    Row4: row4,
  });
  handleData(url, getRacks, callbackError, "PUT", body);
  showMessage("Wijzigingen opgeslagen.");
};

const callbackDeleteRack = function (rackId) {
  let url = `${baseUrl}/racks/${rackId}`;
  handleData(url, getRacks, callbackError, "DELETE");
  showMessage("Rek(ken) verwijderd.");
};

const callbackRacks = function (jsonObject) {
  customerRacks = jsonObject;
  showRacks(customerRacks);
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
  handleData(url, callbackRacks, callbackError, "GET");
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

const listenToCheckBox = function () {
  for (const b of document.querySelectorAll(".js-chekcbox")) {
    b.addEventListener("change", function () {
      let rackId = this.getAttribute("data-rackId");
      if (this.checked) {
        selectedRacks.push(rackId);
      } else {
        let index = selectedRacks.indexOf(rackId);
        if (index > -1) {
          selectedRacks.splice(index, 1);
        }
      }
      if (selectedRacks.length > 0) {
        htmlDeleteButton.disabled = false;
      } else {
        htmlDeleteButton.disabled = true;
      }
    });
  }
};

const listenToDeleteButton = function () {
  htmlDeleteButton.addEventListener("click", function () {
    for (let rackId of selectedRacks) {
      callbackDeleteRack(rackId);
    }
  });
};

const listenToCustomerSearch = function () {
  htmlCustomerSearch.addEventListener("input", function () {
    let arr = customerList.filter(function (elem) {
      return (
        elem.Name.includes(htmlCustomerSearch.value.toLowerCase()) ||
        elem.Id.includes(htmlCustomerSearch.value.toLowerCase())
      );
    });
    showFilteredRacks(arr);
  });
};

// Event listeners

//#region ***  Init / DOMContentLoaded                  ***********
const init = function () {
  console.log("DOM Content Loaded.");
  htmlEmptyRacks = document.querySelector(".js-new-racks");
  htmlRacks = document.querySelector(".js-racks");
  htmlCustomerSearch = document.querySelector(".js-search-manage");
  htmlMessage = document.querySelector(".js-message");
  htmlMessageText = document.querySelector(".js-message-text");

  getCustomersManage();
  getEmptyRacks();
  listenToCustomerSearch();
};

document.addEventListener("DOMContentLoaded", init);
//#endregion
