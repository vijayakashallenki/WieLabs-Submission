import path from "path";
import { parseCompanyList, scrapeCompanyPages } from "./utils";
import fse from "fs-extra";
import fs from "fs";

/**
 * The entry point function. This will read the provided CSV file, scrape the companies'
 * YC pages, and output structured data in a JSON file.
 */


export async function processCompanyList() {
  const csvPath = 'inputs/companies.csv';

  // Parses the CSV file and returns a list of companies and their YC URLs
  const companies  = await parseCompanyList(csvPath);
  //console.log(companies);
  console.log("✅ parsing CSV file");

  // Creates the 'out' Folder if it doesn't exist
  await createFol("./out");

  console.log("✅ Started Scrapping the webpages");
  // Scrape company pages
  const scrapedData = await scrapeCompanyPages(companies);

  //Creates the directory called 'out' and store the scrapedData in it : src:From phind.com
  await fse.writeFile(
    "./out/scraped.json",
    JSON.stringify(scrapedData, null, 2)
  );
}

const createFol = (
  name: string
): Promise<string | undefined> => {
  const dir = path.join(name);
  return fs.promises.mkdir(dir, { recursive: true });
};
