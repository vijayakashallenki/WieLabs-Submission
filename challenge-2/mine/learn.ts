import * as fs from 'fs';
import * as fastcsv from 'fast-csv';
import { RequestQueue, CheerioCrawler } from 'crawlee';


const jsonoutput : any[] = [];

//Structure of the data
interface Company {
  'Company Name': string;
  'YC URL': string;
}

// An array to store the parsed data
const companies: Company[] = [];

// Read stream from the CSV file code line
const readStream = fs.createReadStream('inputs/companies.csv');

// CSV parsing stream code line
const csvStream = fastcsv.parse({ headers: true });

// Piping the read stream to the CSV parsing stream
readStream
  .pipe(csvStream)
  .on('data', (row: Company) => companies.push(row))
  .on('end', async () => {
    console.log('CSV file successfully processed');
    console.log(companies);
    // new instance of RequestQueue
    const requestQueue = await RequestQueue.open();

    // Looping over each company and adding a request to the requestqueue
    companies.forEach((company) => {
      requestQueue.addRequest({ url: company['YC URL'] });
    });

    // Creating the crawler and adding the queue with our URLs
    const crawler = new CheerioCrawler({
      requestQueue,
      async requestHandler({ $, request }) {
        // Extracting the company name and founding year
        const title = $('title').text();
        const founded = $('p.founded').text();

        // Log the extracted data
        jsonoutput.push({ title, founded });
      }
    });

    // Start the crawler and wait for it to finish
    await crawler.run();
    await console.log(jsonoutput);
  });

  
