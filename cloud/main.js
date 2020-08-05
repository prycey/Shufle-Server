const { User } = require("parse");

Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});


Parse.Cloud.define('create_card_batch', async function(req, res) {
  const user = req.user;

  const UserClass = Parse.Object.extend("User");
  const userQuery = new Parse.Query(UserClass);
  userQuery.notEqualTo("objectId", user.get("objectId"));
  userQuery.limit(5);
  const randomUsers = await userQuery.find({ useMasterKey: true });

  // query for these users' cards
  const CardClass = Parse.Object.extend("Card");
  let queryList = [];
  randomUsers.forEach((user) => {
    const query = new Parse.Query(CardClass);
    query.equalTo("owner", user);
    queryList.push(query);
  });

  const cardQuery = Parse.Query.or(queryList);
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
