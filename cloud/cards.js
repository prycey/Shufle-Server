fs = require('fs');

Parse.Cloud.define('get_questions', async function(req, res) {
    let contents = fs.readFileSync('public/assets/data/questions.json', 'utf8');
    console.log("contents:", contents);
    return JSON.parse(contents);
});
