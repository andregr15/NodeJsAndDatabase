import { Router } from 'express';

import { getCustomRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionRepository);

  const summary = {
    transactions: await transactionRepository.find({ relations: ['category'] }),
    balance: await transactionRepository.getBalance(),
  };
  response.json(summary);
});

transactionsRouter.post('/', async (request, response) => {
  const transaction = await new CreateTransactionService().execute(
    request.body,
  );
  response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
