Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});

Parse.Cloud.define('create_card_batch', async function(req, res) {
  const UserClass = Parse.Object.extend("User");
  const query = new Parse.Query(UserClass);
  query.equalTo("username", "katie");
  const userObjs = await query.find();

  console.log(userObjs);

  const card1 = userObjs[0].get("cards")[0];
  const q = card1.get("question");
  const a = card1.get("answer");

  console.log(card1);
  console.log(q);
  console.log(a);

  return [
    {
      question: q,
      answer: a
    }
  ];
});
