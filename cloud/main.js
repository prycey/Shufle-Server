
const msging = require('/app/cloud/messaging.js')
const cardsAPI = require('/app/cloud/cards.js');
const util = require('/app/cloud/util.js');

Parse.Cloud.beforeSave(Parse.User, (request) => {
    const user = request.object;
    // if (user.get("seen_users") === undefined) {
    //     rel = Parse.Relation();
    //     user.set("seen_users", );
    // }

    // let cards = user.get("cards");
    // if (cards !== undefined) {
    //     if (cards.length > cardsAPI.MAX_CARDS) {
    //         throw "Cannot have more than " + cardsAPI.MAX_CARDS + " cards";
    //     }
    //     let seen = new Set();
    //     for (let i = 0; i < cards.length; i++) {
    //         let card = cards[i];
    //         let q = card.get("question");
    //         console.log(card, "question:", q);
    //         if (seen.has(q)) {
    //             throw "Cannot answer the same question twice";
    //         }
    //         seen.add(q);
    //     }
    // }
});


/*
 * potential TODO: query for 6 users and ignore one if it happens to be yourself (can get rid of
 * the notEqualTo constraint). Will need to test for efficiency
 */
Parse.Cloud.define('create_card_batch', async function(req, res) {
    let user = req.user;

    let tempStoragePromise = util.getUserTempStorage(user);

    // query 5 random users, excluding ourself, who we have not yet seen
    // (whenever another user's cards have been dealt to someone, they add
    // themselves to the list of seen_users in the user who's cards they
    // saw)
    const userQuery = new Parse.Query("_User");
    userQuery.notEqualTo("objectId", user.id);
    //userQuery.notEqualTo("seen_users", user.id);
    userQuery.limit(5);
    const randomUsers = await userQuery.find({ useMasterKey: true });

    if (randomUsers.length === 0) {
        // no users found
        console.log("found nobody!");
        return [];
    }

    // query for these users' cards
    const CardClass = Parse.Object.extend("Card");
    let queryList = [];
    randomUsers.forEach((user) => {

        const query = new Parse.Query(CardClass);
        query.equalTo("owner", user);
        queryList.push(query);
    });


    //let seen_users = user.relation("seen_users");
    // save the relation
    //user.save(null, { useMasterKey: true });

    console.log("users", randomUsers);
    console.log("queries", queryList);

    const cardQuery = util.queryOrAll(queryList);
    const cards = await cardQuery.find({ useMasterKey: true });

    console.log("card query:", cardQuery);
    console.log(cards);

    let cardList = [];

    cards.forEach((card) => {
        cardList.push({
            question: card.get("question"),
            answer: card.get("answer")
        });
    });

    console.log(cardList);

    let tempStorage = await tempStoragePromise;
    tempStorage.set("card_list", cards);
    tempStorage.save(null, { useMasterKey: true });

    return cardList;
});


/*
 * expect format of cardListWithAnswers:
 *
 *  [
 *      {
 *          question: "question 1 text...",
 *          answer: "answer to that question...",
 *          swipe: true/false (yes/no)
 *      },
 *      {
 *          ...
 *      },
 *      ... (x23)
 *  ]
 */
Parse.Cloud.define('send_answers', async function(req, res) {
    let user = req.user;

    const cardListWithAnswers = req.params;

    let tempStorage = await util.getUserTempStorage(user);

    let cardList = tempStorage.get("card_list");

    if (cardList === undefined) {
        // we don't appear to have the card list matched saved, for now let's just ignore it :)
        return;
    }

    // TODO do something with their answers

    // we can now remove the current card list from temporary storage
    tempStorage.unset("card_list");
    tempStorage.save(null, { useMasterKey: true });
});
