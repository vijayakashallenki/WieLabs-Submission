import { processDataDump } from "./challenge";

/**
 * This is the entry point for the challenge.
 * This will run your code.
 */
async function scrape(){
await processDataDump();
console.log("✅ Done!");
}
scrape();
