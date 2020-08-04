Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});

Parse.Cloud.define('create_card_batch', async function(req, res) {
  const UserClass = Parse.Object.extend("User");
  const query = new Parse.Query(UserClass);
  query.equalTo("username", "katie");
  const userObjs = await query.find();

  console.log(userObjs);

  const cards = userObjs[0].get("cards");
  console.log(cards);

  let cardList = [];
  const CardClass = Parse.Object.extend("Card");

  cards.forEach((card) => {
    console.log("card", card);
    const CardQuery = new Parse.Query(CardClass);
    CardQuery.equalTo("objectId", card.get("objectId"));
    const resCard = await query.find();

    cardList.push({
      question: resCard.get("question"),
      answer: resCard.get("answer")
    });

    console.log(resCard);
  });
  console.log(cardList);

  return cardList;
});
