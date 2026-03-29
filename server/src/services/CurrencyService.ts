import axios from 'axios';

const BASE_CURRENCY = process.env.BASE_CURRENCY || 'USD';

export const convertToCurrency = async (amount: number, from: string) => {
  if (from === BASE_CURRENCY) {
    return { convertedAmount: amount, rate: 1.0 };
  }

  try {
    const res = await axios.get(`https://open.er-api.com/v6/latest/${from}`);
    const rate = res.data.rates[BASE_CURRENCY];

    return {
      convertedAmount: amount * (rate || 1.0),
      rate: rate || 1.0
    };
  } catch (error) {
    console.warn('Currency API down, using fallback 1.0 rate');
    return { convertedAmount: amount, rate: 1.0 };
  }
};
