import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryName: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryName,
  }: Request): Promise<Transaction> {
    console.log('categoryName', categoryName);
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && balance.total < value)
      throw new AppError('Não há recursos suficientes em caixa.', 400);

    let category = await categoryRepository.findOne({
      where: { title: categoryName },
    });

    console.log('category', category);

    if (!category) {
      const createCategory = categoryRepository.create({
        title: categoryName,
      });
      category = await categoryRepository.save(createCategory);
    }

    const createTransaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    const transaction = await transactionRepository.save(createTransaction);

    return transaction;
  }
}

export default CreateTransactionService;
