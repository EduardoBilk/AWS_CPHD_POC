const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
});
const s3 = new AWS.S3();

module.exports = {
    TWITTER_API_END_POINT: 'https://api.twitter.com/2/tweets/search/recent',
    TWITTER_API_RULES_POINT: 'https://api.twitter.com/2/tweets/search/stream/rules',
    TWITTER_API_STREAM_POINT: 'https://api.twitter.com/2/tweets/search/stream',
    FILENAME: 'tweets.csv',
    BUCKET_NAME: 'test-comprehend-02',
    INPUT_FOLDER: 'input-comprehend',
    OUTPUT_FOLDER: 'output-comprehend',
    CPHD_ID: '667310078461-SENTIMENT-0239fdaaf0508c14689c9c32bbde63bb', // file key of the output of AWS Comprehend. 
    s3
}