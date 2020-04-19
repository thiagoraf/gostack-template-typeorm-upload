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

    const result = transactions.reduce(
      (accumulator: Balance, transaction: Transaction) => {
        accumulator.income +=
          transaction.type === 'income' ? transaction.value : 0;
        accumulator.outcome +=
          transaction.type === 'outcome' ? transaction.value : 0;

        accumulator.total = accumulator.income - accumulator.outcome;

        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return result;
  }
}

export default TransactionsRepository;
