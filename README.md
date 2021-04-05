# POC AWS Comprehend

### Step 1 - Setting up ENV variables
--------------------
Rename `.env.structure` to `.env`



### Step 2 - Getting the Twitter BEARER TOKEN
--------------------
Acess [Twitter Dev](https://developer.twitter.com/) portal and create yourself a Bearer token to consume from the twitter API.

Paste your token on the `.env` file.



### Step 3 - AWS Setup
--------------------

Paste your AWS credentials on the `.env` file.

Make a AWS Bucket with an *Input* and an *output* folder in it

copy the name of the bucket you just created to `BUCKET_NAME` field in `constants.js`.
do the same for the input and output folders into `INPUT_FOLDER` and `OUTPUT_FOLDER`.

You may skip the collection of the data (step 4) if you want to.
To do so, in your input folder you can upload the content from temp file *OR* the tweets.csv.



### Step 4 - Collect the data
--------------------
There are 2 way of collecting data from the Twitter API (there are more, but i'll stick with this two for now):

- Stream
- Recent Search

##### Stream
With the stream option you connects with the Twitter API and listen to a tweet that complies with the rule you've set up.
You can read more about Rule's definition [here](https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/integrate/build-a-rule).

In the `tweet-stream.js` file you can change the rule to fit your needs.

```
const rules = [
    {
        'value': '"Snyder Cut" lang:pt -is:retweet -has:links',
        'tag': 'liga justiça snyder'
    },
];
```

To start your stream data gathering just:
```
node tweet-stream.js
```

Each tweet caught on the stream will be saved in the `temp` folder as a `.csv` file and will be sent to the S3 bucket previously configured.

##### Recent Search
Twitter also gives us the possibility to search for tweets in a 7-day window.
For this you must pass your parameter of the search in the body of your request.

In the `tweet-search.js` file you can change this parameters to fit your needs.

```
const params = {
    'query': '"Snyder Cut" lang:pt -is:retweet -has:links',
    'tweet.fields': 'author_id',
    'max_results': 100
}
```

To start your recent seatch data gathering just:
```
node tweet-search.js
```

it will compile all tweets for each page of the results into a `.csv` file (named as configured in `constants.js`) and then upload this file to the S# bucket previously configured.



### Step 5 - Do the Thing
--------------------
Now you are ready to set up your analysis on AWS Comprehend.

1. Lauch it from yout console (https://console.aws.amazon.com/comprehend/);
2. Click on 'Analysis Job';
3. Create a Job;
4. Give it a name;
5. Set the Analysis Type to be Sentiment;
6. Set the language of the input;
7. Browse on S3 to set the input file/folder and set the format accordingly;
8. Set the output folder in S3
9. give it a IAM Role
10. Done!

You should wait until the analysis is completed, you can follow its progress on the Analysis Job dashboard.



### Step 6 - Analyse it!
--------------------
AWS comprehend will create a folder into you output folder.
Copy that folders name and copy it to `CPHD_ID`field on `constants.js`

Now you can see a brief analysis on your console:

```
node output-analyser.js
```



