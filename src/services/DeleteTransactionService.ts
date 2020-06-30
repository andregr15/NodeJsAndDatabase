import { isUuid } from 'uuidv4';
import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    if (!isUuid(id)) {
      throw new AppError('Only accepts uuid ID', 400);
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.findOne(id);
    if (!transaction) {
      throw new AppError(`There is no transaction with the ID ${id}`, 404);
    }

    await transactionsRepository.delete(transaction.id);
  }
}

export default DeleteTransactionService;
