require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const decompress = require('decompress');
AWS.config.update({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
});
const s3 = new AWS.S3();


// Definição das constantes conforme S3
// const CPHD_ID = '667310078461-SENTIMENT-9865f33d3a5ef1f1035883a5eec2e137' //<- file
const CPHD_ID = '667310078461-SENTIMENT-0239fdaaf0508c14689c9c32bbde63bb'   // <- Stream

const BUCKET_NAME = 'test-comprehend-02'

//Pega o arquivo, descompacta (tar.gz) e analiza
s3.getObject({ 
    Bucket: BUCKET_NAME, Key: `output-comprehend/${CPHD_ID}/output/output.tar.gz` },
    function (error, data) {
      if (error != null) {
        console.error("Failed to retrieve an object: " + error);
      } else {
        decompress(data.Body, '.').then(files => {
            const output = fs.readFileSync('output', 'utf8');
            const outputArr = output.split('\n').map(v=>{
                return JSON.parse(v||'{}');
            })
            
            const negativeOpinions = outputArr.reduce((acc, v)=>v.Sentiment==='NEGATIVE'?acc+=1:acc,0)
            console.log('negativeOpinions: ',negativeOpinions)
            const neutralOpinions = outputArr.reduce((acc, v)=>v.Sentiment==='NEUTRAL'?acc+=1:acc,0)
            console.log('neutralOpinions: ',neutralOpinions)
            const positiveOpinions = outputArr.reduce((acc, v)=>v.Sentiment==='POSITIVE'?acc+=1:acc,0)
            console.log('positiveOpinions: ',positiveOpinions)
            const mixedOpinions = outputArr.reduce((acc, v)=>v.Sentiment==='MIXED'?acc+=1:acc,0)
            console.log('mixedOpinions: ',mixedOpinions)
            const totalOpinions = negativeOpinions + neutralOpinions + positiveOpinions +mixedOpinions
            console.log('totalOpinions: ',totalOpinions, '\n')
            
            console.log('Analisando os dados recuperados do twitter sobre o Snyder cut,')
            console.log('segue a análise de sentimento feita no AWS Comprehend:')
            console.log(`${parseFloat((mixedOpinions/totalOpinions)*100).toFixed(2)}% das pessoas tiveram reações mistas ao filme`)
            console.log(`${parseFloat((negativeOpinions/totalOpinions)*100).toFixed(2)}% das pessoas tiveram reações negativas ao filme`)
            console.log(`${parseFloat((neutralOpinions/totalOpinions)*100).toFixed(2)}% das pessoas tiveram reações neutras ao filme`)
            console.log(`${parseFloat((positiveOpinions/totalOpinions)*100).toFixed(2)}% das pessoas tiveram reações positivas ao filme`)
            console.log('\nnegativas: \n')
            
            // Descomentar abaixo se vc quer que ele plote os sentimentos negativos
            // outputArr.forEach(v=>{
                
            //     if (v.Sentiment==='NEGATIVE'){
            //         console.log(fs.readFileSync(`temp/${v.File}`, 'utf8').toString())
            //     }
            // })
      });      
    }  
});    
  



