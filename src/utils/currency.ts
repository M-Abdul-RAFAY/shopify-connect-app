// Currency formatting utilities for Shopify data

interface CurrencyFormatterOptions {
  shopCurrency?: string;
  moneyFormat?: string;
  moneyWithCurrencyFormat?: string;
}

const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  PKR: "Rs",
  INR: "₹",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  SGD: "S$",
  HKD: "HK$",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  CHF: "CHF",
  PLN: "zł",
  CZK: "Kč",
  HUF: "Ft",
  RUB: "₽",
  BRL: "R$",
  MXN: "$",
  ARS: "$",
  CLP: "$",
  COP: "$",
  PEN: "S/",
  UYU: "$U",
  ZAR: "R",
  NGN: "₦",
  EGP: "E£",
  AED: "د.إ",
  SAR: "ر.س",
  QAR: "ر.ق",
  KWD: "د.ك",
  BHD: "ب.د",
  OMR: "ر.ع.",
  JOD: "د.ا",
  LBP: "ل.ل",
  TRY: "₺",
  ILS: "₪",
  THB: "฿",
  PHP: "₱",
  MYR: "RM",
  IDR: "Rp",
  VND: "₫",
  TWD: "NT$",
  NZD: "NZ$",
};

export const createCurrencyFormatter = (options: CurrencyFormatterOptions) => {
  const {
    shopCurrency = "USD",
    moneyFormat = "${{amount}}",
    moneyWithCurrencyFormat = "${{amount}} {{currency}}",
  } = options;

  return (
    amount: string | number,
    withCurrency = false,
    orderCurrency?: string
  ) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    const currency = orderCurrency || shopCurrency;

    if (withCurrency && moneyWithCurrencyFormat) {
      // Use shop's money_with_currency_format
      return moneyWithCurrencyFormat
        .replace("{{amount}}", num.toFixed(2))
        .replace("{{currency}}", currency);
    } else if (moneyFormat && !orderCurrency) {
      // Use shop's money_format for shop currency only
      return moneyFormat.replace("{{amount}}", num.toFixed(2));
    } else {
      // Fallback to simple formatting with appropriate currency symbol
      const symbol = CURRENCY_SYMBOLS[currency] || currency + " ";
      return `${symbol}${num.toFixed(2)}`;
    }
  };
};

// Default formatter for when shop data is not available
export const formatCurrency = (
  amount: string | number,
  currency = "USD",
  withCurrency = false
) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const symbol = CURRENCY_SYMBOLS[currency] || currency + " ";

  if (withCurrency) {
    return `${symbol}${num.toFixed(2)} ${currency}`;
  } else {
    return `${symbol}${num.toFixed(2)}`;
  }
};

export { CURRENCY_SYMBOLS };
