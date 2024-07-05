
import { ethers } from "ethers";
export const formatEther = (amount) => {
  const formattedEther = ethers.utils.formatUnits(amount.toString(), "ether");
  return formattedEther;
};

export const formatDate = (date) => {
  const formattedDate = new Date(
    Number(date.toString() + "000")
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
  return formattedDate;
};

export const formatHash = (hash) => {
  const formattedString = hash.slice(0, 5) + "..." + hash.slice(61, 66);
  return formattedString;
};

export const formatAddress = (address) => {
  const formattedAddy = address.slice(0, 5) + "..." + address.slice(38, 42);
  return formattedAddy;
};

export const getSymbol = (token, tokens, symbols) => {
  if (token === tokens[0].address) {
    return symbols[0];
  } else if (token === tokens[1].address) {
    return symbols[1];
  } else {
    return "";
  }
};
