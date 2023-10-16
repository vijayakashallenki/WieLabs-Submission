// import axios from 'axios';
// import { RequestQueue, CheerioCrawler } from 'crawlee';


// async function scrap() {
//   // await axios.get('https://www.ycombinator.com/companies/fiber-ai');
//   const requestQueue = await RequestQueue.open();
//   await requestQueue.addRequest({ url: 'https://www.ycombinator.com/companies/fiber-ai' });

//   const crawler = new CheerioCrawler({
//     requestQueue,
//     // The `$` argument is the Cheerio object
//     // which contains parsed HTML of the website.
//     async requestHandler({ $, request, body }) {
//       //console.log(body);
//       const title =  $('.prose h1').text();
//       const founded = $('p.founded').text();
//       console.log({title,founded});
//     }
//   });

//   // Start the crawler and wait for it to finish
//   await crawler.run();
// }

// scrap();

import puppeteer from 'puppeteer';
import { RequestQueue, CheerioCrawler } from 'crawlee';

async function scrap() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.ycombinator.com/companies/fiber-ai');
  const html = await page.content();
  await browser.close();

  const requestQueue = await RequestQueue.open();
  await requestQueue.addRequest({ url: 'https://www.ycombinator.com/companies/fiber-ai'});

  const crawler = new CheerioCrawler({
    requestQueue,
    async requestHandler({ $, request, body }) {
      const title =  $('div.prose > h1').text();
      console.log({title});
    }
  });

  await crawler.run();
}

scrap();

