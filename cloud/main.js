const { User } = require("parse");

// Parse.Cloud.afterSave("_User", (request) => {
//     const user = request.object;
//     if (user.get("seen_users") === undefined) {
//         rel = Parse.Relation();
//         user.set("seen_users", );
//     }
// });


async function getUserTempStorage(user) {
    const TempStorage = Parse.Object.extend("TempStorage");

    let tempStorage;
    let tempStorageId = user.get("temp_storage");
    if (tempStorageId === undefined) {
        // have not yet created temporary storage
        tempStorage = new TempStorage();
        user.set("temp_storage", tempStorage);
        await user.save(null, { useMasterKey: true });
    }
    else {
        const tempStorageQuery = new Parse.Query(TempStorage);
        tempStorage = await tempStorageQuery.get(tempStorageId, { useMasterKey: true });
    }
    console.log(tempStorage);
    return tempStorage;
}



Parse.Cloud.define('create_card_batch', async function(req, res) {
    let user = req.user;

    // query 5 random users, excluding ourself, who we have not yet seen
    // (whenever another user's cards have been dealt to someone, they add
    // themselves to the list of seen_users in the user who's cards they
    // saw)
    const userQuery = new Parse.Query("_User");
    userQuery.notEqualTo("objectId", user.id);
    userQuery.notEqualTo("seen_users", user.id);
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


    let seen_users = user.relation("seen_users");
    // save the relation
    user.save(null, { useMasterKey: true });

    console.log("users", randomUsers);
    console.log("queries", queryList);

    const cardQuery = Parse.Query.or(queryList[0], queryList[1]);
    const cards = await cardQuery.find({ useMasterKey: true });

    console.log(cards);

    let cardList = [];

    cards.forEach((card) => {
        cardList.push({
            question: card.get("question"),
            answer: card.get("answer")
        });
    });

    console.log(cardList);

    getUserTempStorage(user);

    return cardList;
});
