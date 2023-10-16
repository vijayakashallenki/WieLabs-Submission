//No use With this project created for my help!!

import fs from 'fs';
import csv from 'csv-parser';

export const parseCsvFile = (filePath: string) => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

const processDataDump = async () => {
  const filePath = 'tmp/dump/customers.csv';
  const data = await parseCsvFile(filePath);
  console.log(data);
};
processDataDump();


// export const processDataDump = async () => {
//   const filePath = 'tmp/extracted/customers.csv';
//   const data = await parseCsvFile(filePath);
//   console.log(data);
// };
