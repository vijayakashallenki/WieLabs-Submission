import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { pipeline } from 'stream';
import { promisify } from 'util';

//This will download the zipfile from the url and store it in the temp directory 
const downloadFile = async (url: string, destination: string) => {
  const fileStream = fs.createWriteStream(destination);
  const response = await new Promise<http.IncomingMessage>((resolve, reject) => {
    const request = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download file, status code: ${res.statusCode}`));
      }
      resolve(res);
    });

    request.on('error', (err) => {
      reject(err);
    });
     
    // response.on('data', (chunk) => {
    //   console.log('Received a chunk of data:');
    //   console.log(chunk.toString()); 
    // });
  });
  await promisify(pipeline)(response, fileStream);
};
  // const url = 'https://wielabs-task.s3.ap-south-1.amazonaws.com/dump.tar.gz';
  // const destination = 'tmp/dump.tar.gz';
  // downloadFile(url, destination);

//exporting the downloadData function  
export const downloadData = async () => {
  const url = 'https://wielabs-task.s3.ap-south-1.amazonaws.com/dump.tar.gz';
  const destination = 'tmp/dump.tar.gz';
  await downloadFile(url, destination);
};
