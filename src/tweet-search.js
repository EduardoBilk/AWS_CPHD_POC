require('dotenv').config();
const {
    TWITTER_API_END_POINT,
    FILENAME,
    BUCKET_NAME,
    INPUT_FOLDER,
    s3
 } = require('./constants.js');
const needle = require('needle');
const fs = require('fs');

const token = process.env.BEARER_TOKEN;

async function getRequest(nextToken) {

    const params = {
        'query': '"Snyder Cut" lang:pt -is:retweet -has:links',
        'tweet.fields': 'author_id',
        'max_results': 100
    }
    if (nextToken) params.next_token = nextToken

    const res = await needle('get', TWITTER_API_END_POINT, params, {
        headers: {
            "User-Agent": "v2FullArchiveJS",
            "authorization": `Bearer ${token}`
        }
    })

    if (res.body) {
        return res.body;
    } else {
        throw new Error('Unsuccessful request');
    }
}

function writeToCSV(response){
    const fd = fs.openSync(FILENAME, 'a');
    response.data.forEach((v, i) =>{
        fs.appendFileSync(fd, `${v.text.replace(/\n/g,' ').trim()}\n`);
    })
    fs.closeSync(fd);
};

const uploadFile = () => {
    const fileContent = fs.readFileSync(FILENAME);

    const params = {
        Bucket: BUCKET_NAME,
        Key: `${INPUT_FOLDER}/${FILENAME}`, // File name you want to save as in S3
        Body: fileContent
    };
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
};

(async () => {
    
    try {        
        let response;
        do{
            response = await getRequest(response?.meta?.next_token || '');
            console.log(response);
            writeToCSV(response);
        }while(response.meta.next_token)
        
        uploadFile();
    } catch (e) {
        console.error(e);
        process.exit(-1);
    }
    process.exit();
})();