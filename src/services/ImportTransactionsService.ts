import fs from 'fs';
import csvParse from 'csv-parse';
import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Item {
  title: string;
  type: 'outcome' | 'income';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    if (!path.includes('.csv')) {
      throw new AppError('Only accepts .csv files');
    }
    const data = await this.readCsv(path);
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const transactions = await Promise.all(
      data.map(
        async (item: Item): Promise<Transaction> => {
          const { title, type, value, category } = item;

          let newCategory = await categoryRepository.findOne({
            where: { title: category },
          });

          if (!newCategory) {
            newCategory = categoryRepository.create({ title: category });
            await categoryRepository.save(newCategory);
          }

          const transaction = transactionRepository.create({
            title,
            type,
            value,
            category: newCategory,
            category_id: newCategory.id,
          });

          await transactionRepository.save(transaction);
          return transaction;
        },
      ),
    );

    return transactions;
  }

  private async readCsv(path: string): Promise<Item[]> {
    const readCsvStream = fs.createReadStream(path);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCsv = readCsvStream.pipe(parseStream);

    const lines: Item[] = [];

    parseCsv.on('data', (line: string[]) => {
      lines.push({
        title: line[0],
        type: line[1] === 'income' ? 'income' : 'outcome',
        value: Number(line[2]),
        category: line[3],
      });
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
