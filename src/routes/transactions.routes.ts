import { Router } from 'express';

import { getCustomRepository } from 'typeorm';

import multer from 'multer';
import upload from '../config/upload';

import TransactionRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

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
  await new DeleteTransactionService().execute(request.params.id);
  response.status(204).send();
});

transactionsRouter.post(
  '/import',
  multer(upload).single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const transactions = await importTransactionsService.execute(
      request.file.path,
    );

    response.send(transactions);
  },
);

export default transactionsRouter;
