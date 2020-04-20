import { getCustomRepository } from 'typeorm';
import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();

  return response.json({
    transactions,
    balance: await transactionRepository.getBalance(),
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    categoryName: category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const transactionRepository = getCustomRepository(TransactionsRepository);
  await transactionRepository.delete(id);
  return response.status(200).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionService = new ImportTransactionsService();
    const transactions = await importTransactionService.execute(
      request.file.path,
    );

    for (const i in transactions) {
      const createTransactionService = new CreateTransactionService();
      await createTransactionService.execute({
        ...transactions[i],
        categoryName: transactions[i].category,
      });
    }

    /* transactions.forEach(async transaction => {
      const createTransactionService = new CreateTransactionService();
      const result = await createTransactionService.execute({
        ...transaction,
        categoryName: transaction.category,
      });
      return result;
    }); */

    return response.json({ ok: true });
  },
);

export default transactionsRouter;
