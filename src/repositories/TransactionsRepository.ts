import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = this.reduceValues(transactions, 'income');
    const outcome = this.reduceValues(transactions, 'outcome');
    const total = income - outcome;

    const balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }

  private reduceValues(transactions: Transaction[], type: string): number {
    return transactions
      .filter(x => x.type === type)
      .reduce((accumulated, actual) => {
        accumulated += Number(actual.value);
        return accumulated;
      }, 0);
  }
}

export default TransactionsRepository;
