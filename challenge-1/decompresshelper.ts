import tar from 'tar-fs';
import fs from 'fs';
import zlib from 'zlib';


//This will decompress the tar file that we have downloaded and csv files are generated
export const extractTarGzFile = (source: string, destination: string) => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(source);
    const gunzip = zlib.createGunzip();
    const extract = tar.extract(destination);

    readStream
      .pipe(gunzip)
      .pipe(extract)
      .on('finish', resolve)
      .on('error', reject);
  });
};

  //  const source = 'tmp/dump.tar.gz';
  //  const destination = 'tmp/';
  //  extractTarGzFile(source, destination);

//exporting the deCompressData() function  
export const deCompressData = async () => {
  const source = 'tmp/dump.tar.gz';
  const destination = 'tmp/';
  await extractTarGzFile(source, destination);
};


