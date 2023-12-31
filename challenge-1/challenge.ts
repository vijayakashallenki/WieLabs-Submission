/**
 * The entry point function. This will download the given dump file, extract/decompress it,
 * parse the CSVs within, and add the data to a SQLite database.
 * This is the core function you'll need to edit, though you're encouraged to make helper
 * functions!
 */
import { downloadData } from "./downloadhelper";
import { deCompressData } from './decompresshelper';
import { databaseStr } from "./databasestrhelper";
export async function processDataDump() {
//helper function for downloading the data from https://wielabs-task.s3.ap-south-1.amazonaws.com/dump.tar.gz 
   try{
    await downloadData();
   }catch(err){
      console.log(err);
   }
//helper function for decompressing the data to CSV file
try{
   await deCompressData();
}catch(err){
   console.log(err);
}
//helper function for storing the csv files in the table at sqlite3 database   
   try{
   await databaseStr();
   }
catch(err){
   console.log(err);
}
processDataDump();
