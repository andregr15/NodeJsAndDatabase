import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: string;
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError(
        'Invalid type, accept only "income" or "outcome" values!',
        400,
      );
    }

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && Number(value) > total) {
      throw new AppError('There is no available balance to this outcome');
    }

    let newCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!newCategory) {
      newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      category_id: newCategory.id,
      category: newCategory,
      type,
    });

    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
