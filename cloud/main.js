Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});


Parse.Cloud.define('create_card_batch', async function(req, res) {
  const user = req.user;

  const CardClass = Parse.Object.extend("Card");
  const query = new Parse.Query(CardClass);
  query.notEqualTo("owner", user);
  const cards = await query.find({ useMasterKey: true });

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
