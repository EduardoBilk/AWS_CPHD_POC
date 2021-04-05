require('dotenv').config();
const { 
    TWITTER_API_RULES_POINT,
    TWITTER_API_STREAM_POINT,
    BUCKET_NAME,
    INPUT_FOLDER,
    s3
} = require('./constants.js');
const needle = require('needle');
const fs = require('fs')

const token = process.env.BEARER_TOKEN;

const rules = [
    {
        'value': '"Snyder Cut" lang:pt -is:retweet -has:links',
        'tag': 'liga justiça snyder'
    },
];

async function getAllRules() {
    const response = await needle('get', TWITTER_API_RULES_POINT, {
        headers: {
            "authorization": `Bearer ${token}`
        }
    })
    if (response.statusCode !== 200) {
        console.log("Error:", response.statusMessage, response.statusCode)
        throw new Error(response.body);
    }
    return (response.body);
}

async function deleteAllRules(rules) {

    if (!Array.isArray(rules.data)) {
        return null;
    }
    const ids = rules.data.map(rule => rule.id);
    const data = {
        "delete": {
            "ids": ids
        }
    }
    const response = await needle('post', TWITTER_API_RULES_POINT, data, {
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${token}`
        }
    })
    if (response.statusCode !== 200) {
        throw new Error(response.body);
    }
    return (response.body);
}

async function setRules() {

    const data = {
        "add": rules
    }
    const response = await needle('post', TWITTER_API_RULES_POINT, data, {
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${token}`
        }
    })
    if (response.statusCode !== 201) {
        throw new Error(response.body);
    }
    return (response.body);
}

function streamConnect(retryAttempt) {

    const stream = needle.get(TWITTER_API_STREAM_POINT, {
        headers: {
            "User-Agent": "v2FilterStreamJS",
            "Authorization": `Bearer ${token}`
        },
        timeout: 20000
    });
    console.log('waiting for tweets...')
    stream.on('data', data => {
        try {
            const json = JSON.parse(data);
            console.log(json);
            uploadTweet(json);

            retryAttempt = 0;
        } catch (e) {
            if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
                console.log(data.detail)
                process.exit(1)
            }
            // mantém sinal. Do nothing.
        }
    }).on('err', error => {
        if (error.code !== 'ECONNRESET') {
            console.log(error.code);
            process.exit(1);
        } else {
            setTimeout(() => {
                console.warn("A connection error occurred. Reconnecting...")
                streamConnect(++retryAttempt);
            }, 2 ** retryAttempt)
        }
    });

    return stream;

}
const uploadTweet = (tweet) => {

    fs.writeFileSync(`temp/${tweet.data.id}.csv`,tweet.data.text.replace(/\n/g,' ').trim(), 'utf8')
    console.log(`${tweet.data.id}.csv, created.`)

    const fileContent = fs.readFileSync(`temp/${tweet.data.id}.csv`, 'utf8')

    const params = {
        Bucket: BUCKET_NAME,
        Key: `${INPUT_FOLDER}/${tweet.data.id}.csv`,
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
    let currentRules;

    try {
        currentRules = await getAllRules();
        await deleteAllRules(currentRules);
        await setRules();

    } catch (e) {
        console.error(e);
        process.exit(-1);
    }
    // Listen
    streamConnect(0);
})();