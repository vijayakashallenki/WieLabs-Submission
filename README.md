# Wielabs Challenge



Two Challenges
- `challenge-1` Data processing and pipelining. Processed large files with the Node Streams API and convert CSVs into SQL commands with Knex.
                <br>I took 3 helperfunctions:
                <br>`downloadhelper` : Downloads the `dump.tar.gz` file from the url provided
                <br>`decompresshelper`: Decompress and converts the `.tar.tz` file into CSV file (two files Generated Customers.csv , Organizations.csv)
                <br>`databasestrhelper`: Here it does two things
                <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- parsing the csv
                <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- storing the csv files as tables in sqllite database<br><br>       
- `challenge-2` Web scraping (scraped data from the given list of Y Combinator ("YC") companies). Used tools like Crawlee and Cheerio.
                <br> The steps I followed for this are:
                <br>&nbsp;&nbsp;- Parsing the CSV file in the format
                 <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{
                 <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'Company Name': 'Name Of The Company',
                 <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'YC URL': 'url of the Company'
                 <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}
                <br>&nbsp;&nbsp;- Scrapping data with multiurls:
                <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Used helper functions for getting each element like name, foundedyear , description from the DOM tree
                <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;All the helper functions are at `./utils` folder  
  Instructions to run Challanges:
  - Typescript to run it
  - `npm install`
  - Challenge-1
    - `cd challenge-1` 
    - run `ts-node runner.ts`
  - Challenge-2
    - `cd challenge-2` 
    - run `ts-node runner.ts`


<br>
      
Resources I used:<br>
  <a href="https://stackoverflow.com/questions/77296587/getting-no-value-in-the-console-trying-to-access-a-element-in-the-domtree-webs">- stackoverflow</a><br>
  <a href="">- Github</a><br>
  <a href="https://www.phind.com/">- Phind</a>
  <br><a href="https://crawlee.dev/docs/quick-start">- Crawlee guide</a><br> 
  <a href="https://crawlee.dev/docs/guides/cheerio-crawler-guide">- Cheerio crawler guide.</a><br>
   




