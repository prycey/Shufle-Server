
/*
 *
 * Conversation database structure:
 * {
 *      user1: user1_ptr,
 *      user2: user2_ptr,
 *      last_message: "...",
 *      timesamp: <last time a message was sent>
 * }
 * 
 * Message database structure:
 * {
 *      text: "whatever they said...",
 *      conversation: <ptr to conversation>
 *      timestamp: <when it was sent>
 *      author: <user1_ptr or user2_ptr>
 * }
 */


const util = require('/app/cloud/util.js');


// for use on frontend storage of messages
const AUTHOR_SELF = 0;
const AUTHOR_OTHER = 1;

// for use on backend storage of messages
const AUTHOR_USER1 = 0;
const AUTHOR_USER2 = 1;

/*
 * expecting a message of the format:
 * {
 *      convo_idx: <idx>,
 *      text: "what they said..."
 * }
 */
Parse.Cloud.define('send_message', async function(req, res) {
    const MsgClass = Parse.Object.extend("Message");
    const user = req.user;

    let tempStorage = await util.getUserTempStorage(user);
    let convo_list = tempStorage.get("convo_list");

    if (convo_list === undefined) {
        throw "no conversations have been initiated yet";
    }
    console.log("convo list:", convo_list);

    if (!('convo_idx' in req.params)) {
        // no convo_idx supplied!
        throw "no convo_idx supplied";
    }
    const convo_idx = req.params.convo_idx;
    if (!Number.isInteger(convo_idx) || convo_idx < 0 || convo_idx >= convo_list.length) {
        // invalid convo_idx
        throw "convo_idx is not an integer or out of bounds";
    }
    let convo = convo_list[convo_idx];

    if (!('text' in req.params)) {
        throw "no message given";
    }
    const text = req.params.text;

    let author = req.user.equals(convo.get("user1")) ? AUTHOR_USER1 : AUTHOR_USER2;

    const time = new Date();

    let msg = new MsgClass();
    msg.set("text", text);
    msg.set("author", author);
    msg.set("timestamp", time);
    msg.set("conversation", convo);

    msg.save(null, { useMasterKey: true });

    convo.set("last_message", text);
    convo.set("timestamp", time);
    convo.save(null, { useMasterKey: true });
});


/*
 * queries all the most recent conversations that a user has
 *
 * return format:
 * {
 *      user_name: "...",
 *      last_message: "...",
 *      timestamp: <time_of_last_message>
 * }
 */
Parse.Cloud.define('get_conversations', async function(req, res) {
    const user = req.user;

    const ConvoClass = Parse.Object.extend("Conversation");
    const query1 = new Parse.Query(ConvoClass);
    const query2 = new Parse.Query(ConvoClass);
    query1.equalTo("user1", user);
    query2.equalTo("user2", user);
    const query = Parse.Query.or(query1, query2);

    const convos = await query.find({ useMasterKey: true });

    let convo_list = Promise.all(convos.map(async (convo) => {
        let otherUserPtr;
        console.log("convo:", convo);
        if (convo.get("user1").equals(user)) {
            otherUserPtr = convo.get("user2");
        }
        else {
            otherUserPtr = convo.get("user1");
        }

        const otherQuery = new Parse.Query(Parse.User);
        otherQuery.equalTo("objectId", otherUserPtr.id);
        otherQuery.limit(1);
        let other = await otherQuery.find({ useMasterKey: true });
        let otherName = other[0].get("username");

        return {
            user_name: otherName,
            last_message: convo.get("last_message"),
            timestamp: convo.get("timestamp")
        };
    }));

    let tempStorage = await util.getUserTempStorage(user);

    tempStorage.set("convo_list", convo_list);
    tempStorage.save(null, { useMasterKey: true });

    return convo_list;
});


/*
 * queries all the most recent messages within a given conversation
 *
 * adjusted format of queried conversation:
 *  {
 *      user_name: "...",
 *      last_message: "...",
 *      timestamp: <time_of_last_message>,
 *      messages: [
 *          {
 *              text: "message 1",
 *              author: AUTHOR_SELF or AUTHOR_OTHER,
 *              timestamp: <time_message_was_sent>
 *          },
 *          {
 *              ...
 *          },
 *          ...
 *      ]
 *  }
 * 
 */
Parse.Cloud.define('get_messages', async function(req, res) {
    const user = req.user;

    let tempStorage = await util.getUserTempStorage(user);
    let convo_list = tempStorage.get("convo_list");

    if (!('convo_idx' in req.params)) {
        // no convo_idx supplied!
        throw "no convo_idx supplied";
    }
    const convo_idx = req.params.convo_idx;
    if (!Number.isInteger(convo_idx) || convo_idx < 0 || convo_idx >= convo_list.length) {
        // invalid convo_idx
        throw "convo_idx is not an integer or out of bounds";
    }
    let convo = convo_list[convo_idx];

    if (convo.has('messages')) {
        return convo.get('messages');
    }

    // query server for messages

});


Parse.Cloud.define('create_random_convo', async function(req, res) {
    if (true) {
        return;
    }
    const MsgClass = Parse.Object.extend("Message");
    const ConvoClass = Parse.Object.extend("Conversation");

    // const user1q = new Parse.Query(Parse.User);
    // user1q.equalTo("objectId", "PbY2FyGu1g");
    // let user1 = await user1q.find({ useMasterKey: true });
    // const user2q = new Parse.Query(Parse.User);
    // user2q.equalTo("objectId", "c7loOCLvrj");
    // let user2 = await user2q.find({ useMasterKey: true });

    // let convo = new ConvoClass();
    // convo.set("user1", user1[0]);
    // convo.set("user2", user2[0]);
    // convo.set("timestamp", new Date());

    let convoq = new Parse.Query(ConvoClass);
    let convos = await convoq.find({ useMasterKey: true });

    let convo = convos[0];

    let msg1 = new MsgClass();
    msg1.set("text", "I love Remy");
    msg1.set("author", AUTHOR_USER1);
    msg1.set("timestamp", new Date());
    msg1.set("conversation", convo);

    let msg2 = new MsgClass();
    msg2.set("text", "I also love Remy");
    msg2.set("author", AUTHOR_USER2);
    msg2.set("timestamp", new Date());
    msg2.set("conversation", convo);

    msg1.save(null, { useMasterKey: true });
    msg2.save(null, { useMasterKey: true });

    convo.set("last_message", msg2.get("text"));
    convo.set("timestamp", msg2.get("timestamp"));
    convo.save(null, { useMasterKey: true });
});
