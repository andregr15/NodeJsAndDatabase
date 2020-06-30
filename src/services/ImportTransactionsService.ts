import fs from 'fs';
import csvParse from 'csv-parse';
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    if (!path.includes('.csv')) {
      throw new AppError('Only accepts .csv files');
    }
    const data = await this.readCsv(path);
    const createTransactionService = new CreateTransactionService();

    const transactions = await Promise.all(
      data.map(
        async (item): Promise<Transaction> => {
          const [title, type, value, category] = item;
          const transaction = await createTransactionService.execute({
            title,
            type,
            value: Number(value),
            category,
          });
          return transaction;
        },
      ),
    );

    return transactions;
  }

  private async readCsv(path: string): Promise<string[][]> {
    const readCsvStream = fs.createReadStream(path);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCsv = readCsvStream.pipe(parseStream);

    const lines: string[][] = [];

    parseCsv.on('data', (line: string[]) => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCsv.on('end', resolve);
    });

    parseCsv.unpipe();
    readCsvStream.close();
    await fs.unlink(path, err => {
      if (err) throw new AppError(err.message);
    });
    return lines;
  }
}

export default ImportTransactionsService;
