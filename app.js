function Calculator(form, summary) {
  this.prices = {
    products: 0.5,
    orders: 0.25,
    package: {
      basic: 0,
      professional: 25,
      premium: 60
    },
    accounting: 35,
    terminal: 5
  };

  this.form = {
    products: form.querySelector("#products"),
    orders: form.querySelector("#orders"),
    package: form.querySelector("#package"),
    accounting: form.querySelector("#accounting"),
    terminal: form.querySelector("#terminal")
  };

  this.summary = {
    list: summary.querySelector("ul"),
    items: summary.querySelector("ul").children,
    total: {
      container: summary.querySelector("#total-price"),
      price: summary.querySelector(".total__price")
    }
  };

  // Fix: Initialize the event listeners immediately
  this.addEvents();
}

Calculator.prototype.updateSummary = function (id, calc, total, callback) {
  const summaryItem = this.summary.list.querySelector("[data-id=" + id + "]");
  if (!summaryItem) return;

  const summaryCalc = summaryItem.querySelector(".item__calc");
  const summaryTotal = summaryItem.querySelector(".item__price");

  summaryItem.classList.add("open");

  if (summaryCalc !== null) {
    summaryCalc.innerText = calc;
  }
  
  if (summaryTotal !== null) {
    summaryTotal.innerText = "$" + total;
  }

  if (typeof callback === "function") {
    callback(summaryItem, summaryCalc, summaryTotal);
  }

  // Automatically update the bottom grand total every time a row changes
  this.updateTotal();
};

/* --- UPDATED: Integrated Positive Integer Input Rules --- */
Calculator.prototype.inputEvent = function (e) {
  const input = e.currentTarget;
  const id = input.id;
  let value = input.value;

  // Validation Check: Instantly strip out negative signs or decimal dots
  if (/[^0-9]/.test(value)) {
    value = value.replace(/[^0-9]/g, "");
    input.value = value;
  }

  const numericValue = parseInt(value, 10);
  const singlePrice = this.prices[id];
  const totalPrice = (isNaN(numericValue) ? 0 : numericValue) * singlePrice;

  this.updateSummary(id, value + " * $" + singlePrice, totalPrice, function (item, calc, total) {
    if (value.length === 0 || numericValue === 0) {
      item.classList.remove("open");
    }
  });
};

/* --- FIXED: Integrated Dropdown Click Event Fix --- */
Calculator.prototype.selectEvent = function (e) {
  // FIX: Prevents the global document event click listener from instantly closing the menu
  e.stopPropagation();

  this.form.package.classList.toggle("open");

  // Safely find the dropdown li tag whether the text or background was clicked
  const targetLi = e.target.closest("li");
  const value = targetLi && typeof targetLi.dataset.value !== "undefined" ? targetLi.dataset.value : "";
  const text = targetLi && typeof targetLi.dataset.value !== "undefined" ? targetLi.innerText : "";

  if (value.length > 0) {
    this.form.package.dataset.value = value;
    this.form.package.querySelector(".select__input").innerText = text;

    this.updateSummary("package", text, this.prices.package[value]);
  }
};

Calculator.prototype.checkboxEvent = function (e) {
  const checkbox = e.currentTarget;
  const id = checkbox.id;
  const checked = checkbox.checked;

  this.updateSummary(id, undefined, this.prices[id], function (item) {
    if (!checked) {
      item.classList.remove("open");
    }
  });
};

Calculator.prototype.addEvents = function () {
  // Inputs
  this.form.products.addEventListener("change", this.inputEvent.bind(this));
  this.form.products.addEventListener("keyup", this.inputEvent.bind(this));
  this.form.orders.addEventListener("change", this.inputEvent.bind(this));
  this.form.orders.addEventListener("keyup", this.inputEvent.bind(this));

  // Select
  this.form.package.addEventListener("click", this.selectEvent.bind(this));

  // Checkboxes
  this.form.accounting.addEventListener("change", this.checkboxEvent.bind(this));
  this.form.terminal.addEventListener("change", this.checkboxEvent.bind(this));

  // Global helper closing open selectors smoothly on window boundary click options
  document.addEventListener("click", function () {
    this.form.package.classList.remove("open");
  }.bind(this));
};

Calculator.prototype.updateTotal = function () {
  const show = this.summary.list.querySelectorAll(".open").length > 0;

  if (show) {
    const productSum = this.form.products.value < 0 ? 0 : this.form.products.value * this.prices.products;
    const ordersSum = this.form.orders.value < 0 ? 0 : this.form.orders.value * this.prices.orders;
    
    const selectedPkg = this.form.package.dataset.value;
    const packagePrice = (!selectedPkg || selectedPkg.length === 0) ? 0 : this.prices.package[selectedPkg];
    
    const accounting = this.form.accounting.checked ? this.prices.accounting : 0;
    const terminal = this.form.terminal.checked ? this.prices.terminal : 0;

    this.summary.total.price.innerText = "$" + (productSum + ordersSum + packagePrice + accounting + terminal);
    this.summary.total.container.classList.add("open");
  } else {
    this.summary.total.container.classList.remove("open");
  }
};

/* --- INITIALIZE SCRIPT ON PAGE LOAD --- */
document.addEventListener("DOMContentLoaded", function () {
  const formElement = document.querySelector(".calc__form");
  const summaryElement = document.querySelector(".calc__summary");

  if (formElement && summaryElement) {
    new Calculator(formElement, summaryElement);
  }
});


