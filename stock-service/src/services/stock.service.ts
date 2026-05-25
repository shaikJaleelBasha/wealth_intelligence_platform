import * as stockRepository from "../repositories/stock.repository";

export const createStock = async (data: any) => {
  return await stockRepository.insertStock(data);
};

export const fetchStocks = async () => {
  return await stockRepository.getAllStocks();
};

export const modifyStock = async (stockId: number, data: any) => {
  return await stockRepository.updateStock(stockId, data);
};