Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});

Parse.Cloud.define('create_card_batch', function(req, res) {
  return [
    {
      question: "What is my dog's name?",
      answer: "Remy"
    },
    {
      question: "What is my favorite song?",
      answer: "..."
    }
  ];
});
