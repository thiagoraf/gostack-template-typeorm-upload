import fs from 'fs';
import csv from 'csv-parser';
import getStream from 'get-stream';

interface Response {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(pathFile: string): Promise<Response[]> {
    const transactions: Response[] = [];
    const stream = fs.createReadStream(pathFile, 'utf8').pipe(csv());
    const data = await getStream.array(stream);

    data.map(transaction => {
      const obj = Object.entries(transaction as Response);

      transactions.push({
        title: obj[0][1].trim(),
        type: obj[1][1].trim(),
        value: obj[2][1].trim(),
        category: obj[3][1].trim(),
      });

      return transaction;
    });

    return transactions;
  }
}

export default ImportTransactionsService;
