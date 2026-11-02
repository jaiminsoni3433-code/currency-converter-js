const baseUrl = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const countryList = {
  JPY: "JP",
  USD: "US",
  EUR: "EU",
  INR: "IN"
};

const fromCurrency = document.querySelector(".from select");
const toCurrency = document.querySelector(".to select");
const dropdown = document.querySelectorAll(".dropdown select");
const form = document.querySelector("form");
const msg = document.querySelector(".msg");
const amount = document.querySelector(".amount input");
const defaultMessage = msg.innerText;

// Populate dropdown options and set defaults without relying on select.name
for (let select of dropdown) {
  for (let currcode in countryList) {
    let newOption = document.createElement("option");
    newOption.value = currcode;
    newOption.innerText = currcode;

    // Set default selections directly by checking element identity
    if (select === fromCurrency && currcode === "INR") {
      newOption.selected = true;
    } else if (select === toCurrency && currcode === "USD") {
      newOption.selected = true;
    }

    select.appendChild(newOption);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
  });
}

const updateFlag = (element) => {
  let currCode = element.value;
  let imgTag = element.parentElement.querySelector("img");
  if (imgTag && countryList[currCode]) {
    imgTag.src = `https://flagcdn.com/48x36/${countryList[currCode].toLowerCase()}.png`;
  }
};

updateFlag(fromCurrency);
updateFlag(toCurrency);

form.addEventListener("reset", () => {
  setTimeout(() => {
    amount.value = "1";
    fromCurrency.value = "INR";
    toCurrency.value = "USD";
    updateFlag(fromCurrency);
    updateFlag(toCurrency);
    msg.innerText = defaultMessage;
  }, 0);
});

form.addEventListener("submit", async (evt) => {
  evt.preventDefault();

  const amountValue = Number(amount.value);
  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    amount.value = "1";
  }

  const value = Number(amount.value);

  let from = fromCurrency.value.toLowerCase();
  let to = toCurrency.value.toLowerCase();
  const url = `${baseUrl}/${from}.json`;

  msg.innerText = "Getting exchange rate...";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const rate = data?.[from]?.[to];
    if (typeof rate !== "number") {
      throw new Error(`No exchange rate found for ${fromCurrency.value} to ${toCurrency.value}`);
    }

    const finalAmount = (value * rate).toFixed(2);
    msg.innerText = `${value} ${fromCurrency.value} = ${finalAmount} ${toCurrency.value}`;
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    msg.innerText = error instanceof TypeError
      ? "Unable to reach the currency API. Open this page with Live Server and try again."
      : "Exchange rate unavailable. Please try again.";
  }
});
