Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});


Parse.Cloud.define('create_card_batch', async function(req, res) {
  console.log(req);
  let cardList = [];
  /*
  const CardClass = Parse.Object.extend("Card");
  const query = new Parse.Query(CardClass);
  query.equalTo("username", "katie");
  const userObjs = await query.find();

  console.log(userObjs);

  const cards = userObjs[0].get("cards");
  console.log(cards);

  let cardList = [];

  await Promise.all(cards.map(async (card) => {
    console.log("card", card, card.get("objectId"));
    const CardQuery = new Parse.Query(CardClass);
    CardQuery.equalTo("objectId", card.get("objectId"));
    const resCard = await CardQuery.find();
    console.log("rescard", resCard);

    cardList.push({
      question: resCard[0].get("question"),
      answer: resCard[0].get("answer")
    });

  }));

  console.log(cardList);*/

  return cardList;
});
