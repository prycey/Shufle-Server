Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});

Parse.Cloud.define('create_card_batch', async function(req, res) {
  const UserClass = Parse.Object.extend("User");
  const query = new Parse.Query(UserClass);
  query.equalTo("username", "katie");
  const userObj = await query.find();

  const card1 = userObj.get("cards")[0];

  return [
    {
      question: card1.get("question"),
      answer: card1.get("answer")
    }
  ];
});
