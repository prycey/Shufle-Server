const { User } = require("parse");

Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});


// Parse.Cloud.afterSave("_User", (request) => {
//   const user = request.object;
//   if (user.get("seen_users") === undefined) {
//     rel = Parse.Relation();
//     user.set("seen_users", );
//   }
// });



Parse.Cloud.define('create_card_batch', async function(req, res) {
  let user = req.user;

  const userQuery = new Parse.Query("_User");
  userQuery.notEqualTo("objectId", user.id);
  userQuery.limit(5);
  const randomUsers = await userQuery.find({ useMasterKey: true });

  if (randomUsers.length === 0) {
    // no users found
    console.log("found nobody!");
    return [];
  }

  let seen_users = user.relation("seen_users");

  // query for these users' cards
  const CardClass = Parse.Object.extend("Card");
  let queryList = [];
  randomUsers.forEach((user) => {

    seen_users.add(user);

    const query = new Parse.Query(CardClass);
    query.equalTo("owner", user);
    queryList.push(query);
  });

  // save the relation
  user.save();

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

  return cardList;
});
