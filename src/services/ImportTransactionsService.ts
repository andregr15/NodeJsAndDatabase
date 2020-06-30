import fs from 'fs';
import csvParse from 'csv-parse';
import { getCustomRepository, getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface CSVParsed {
  transactions: CSVTransaction[];
  categories: string[];
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
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

    const { categories, transactions } = data;

    const existentCategories = await categoryRepository.find({
      where: { title: In(categories) },
    });

    const existentsCategoriesTitle = existentCategories.map(item => item.title);

    const newCategories = categories.filter(item => {
      if (!existentsCategoriesTitle.includes(item)) {
        return item;
      }
    });

    const filteredNewCategories = newCategories
      .filter((item, index, arr) => arr.indexOf(item) === index)
      .map(item => ({
        title: item,
      }));

    await categoryRepository.save(filteredNewCategories);

    const newTransactions = await Promise.all(
      transactions.map(
        async (item: CSVTransaction): Promise<Transaction> => {
          const { title, type, value, category } = item;

          const savedCategory = await categoryRepository.findOne({
            title: category,
          });

          const transaction = transactionRepository.create({
            title,
            type,
            value,
            category: savedCategory,
          });

          await transactionRepository.save(transaction);
          return transaction;
        },
      ),
    );

    return newTransactions;
  }

  private async readCsv(path: string): Promise<CSVParsed> {
    const readCsvStream = fs.createReadStream(path);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCsv = readCsvStream.pipe(parseStream);
    const categories: string[] = [];
    const transactions: CSVTransaction[] = [];

    parseCsv.on('data', (line: string[]) => {
      transactions.push({
        title: line[0],
        type: line[1] === 'income' ? 'income' : 'outcome',
        value: Number(line[2]),
        category: line[3],
      });

      categories.push(line[3]);
    });

    await new Promise(resolve => {
      parseCsv.on('end', resolve);
    });

    parseCsv.unpipe();
    readCsvStream.close();
    await fs.unlink(path, err => {
      if (err) throw new AppError(err.message);
    });
    return { transactions, categories };
  }
}

export default ImportTransactionsService;
