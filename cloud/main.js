const { User } = require("parse");

// Parse.Cloud.afterSave("_User", (request) => {
//     const user = request.object;
//     if (user.get("seen_users") === undefined) {
//         rel = Parse.Relation();
//         user.set("seen_users", );
//     }
// });


/*
 * tree-collapse list of queries that are all to be or-ed together
 *
 * i.e. queryOrAll(q1, q2, q3, q4, q5) = ((q1 || q2) || (q3 || q4)) || q5
 */
function queryOrAll(queryList) {
    let resList = [...queryList];
    let dif = 1;
    while (dif < queryList.length) {
        for (let i = 0; i < queryList.length - dif; i += (2 * dif)) {
            resList[i] = Parse.Query.or(resList[i], resList[i + dif]);
        }
        dif *= 2;
    }
    return resList[0];
}


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
        tempStorage = await tempStorageQuery.get(tempStorageId.id, { useMasterKey: true });
    }
    return tempStorage;
}



Parse.Cloud.define('create_card_batch', async function(req, res) {
    let user = req.user;

    let tempStoragePromise = getUserTempStorage(user);

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

    const cardQuery = queryOrAll(queryList);
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
