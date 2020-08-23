
/*
 *
 * Conversation database structure:
 * {
 *      users: [user1_ptr, user2_ptr],
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


// Parse.Cloud.define('send_message', async function(req, res) {
    
// });


// /*
//  * queries all the most recent conversations that a user has
//  *
//  * return format:
//  * 
//  */
// Parse.Cloud.define('get_conversations', async function(req, res) {

// });


// /*
//  * queries all the most recent messages within a given conversation
//  *
//  * return format:
//  * 
//  */
// Parse.Cloud.define('get_messages', async function(req, res) {

// });

