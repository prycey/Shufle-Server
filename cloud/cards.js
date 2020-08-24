fs = require('fs');

const MAX_CARDS = 10;
const NUM_QUESTIONS = 5;

Parse.Cloud.beforeSave("Card", async (request) => {
    const user = request.user;
    const card = request.object;

    let q = card.get("question");

    if (q === undefined) {
        throw "Card must have a question";
    }
    if (!Number.isInteger(q)) {
        throw "Question invalid";
    }
    if (q < 0 || q >= NUM_QUESTIONS) {
        throw "Question invalid";
    }

    // query for this user's cards
    const CardClass = Parse.Object.extend("Card");
    const query = new Parse.Query(CardClass);
    query.equalTo("owner", user);

    const cards = await query.find({ useMasterKey: true });
    if (cards.length === MAX_CARDS) {
        throw "Already have the maximum number of cards";
    }
    cards.forEach((c) => {
        if (q === c.get("question")) {
            c.destroy();
        }
    });

    card.set("owner", user);

});

Parse.Cloud.define('get_questions', async function(req, res) {
    let contents = fs.readFileSync('public/assets/data/questions.json', 'utf8');
    return JSON.parse(contents);
});

