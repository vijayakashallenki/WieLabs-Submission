import fs from 'fs';
import csv from 'csv-parser';
import Knex from 'knex';



//This will parse the csv files and store in the SQLite database 

//interface type for organization
interface Organization {
  Index: string;
  OrganizationId: string;
  Name: string;
  Website: string;
  Country: string;
  Description: string;
  Founded: string;
  Industry: string;
  NumberOfEmployees: string;
}


//interface type for customer
interface Customer {
    Index: string;
    'Customer Id': string;
    'First Name': string;
    'Last Name': string;
    Company: string;
    City: string;
    Country: string;
    'Phone 1': string;
    'Phone 2': string;
    Email: string;
    'Subscription Date': string;
    Website: string;
}


var data: Organization[];
const knexConfig = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './out/database.sqlite',
    },
    useNullAsDefault: true,
  },
};

const knex = Knex(knexConfig.development);

export const parseCsvFile = (filePath: string): Promise<Organization[]> => {
  return new Promise((resolve, reject) => {
    const results: Organization[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push({
          Index: data.Index,
          OrganizationId: data['Organization Id'],
          Name: data.Name,
          Website: data.Website,
          Country: data.Country,
          Description: data.Description,
          Founded: data.Founded,
          Industry: data.Industry,
          NumberOfEmployees: data['Number of employees'],
        });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

async function insertData() {
  try {
    const filePath = './tmp/dump/organizations.csv';
    data = await parseCsvFile(filePath);

    await knex.schema.createTable('organizations', (table) => {
      table.increments('id').primary();
      table.string('Index');
      table.string('OrganizationId');
      table.string('Name');
      table.string('Website');
      table.string('Country');
      table.string('Description');
      table.string('Founded');
      table.string('Industry');
      table.string('NumberOfEmployees');
    });

    // Split the data into chunks of 100
    const chunks: Organization[][] = [];
    for (let i = 0; i < data.length; i += 100) {
      chunks.push(data.slice(i, i + 100));
    }

    // Insert each chunk into the database
    for (let chunk of chunks) {
      await knex('organizations').insert(chunk);
    }

    console.log('Data inserted successfully.');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    await knex.destroy();
  }
}

//exporting the databaseStr() function()
export const databaseStr = async () => {
  await insertData();
};
