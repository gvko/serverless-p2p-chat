# P2P chat library.

This is a serverless p2p chat library retaining chat history in-memory.

## Getting started

Install lib:

```
npm i --save git+https://github.com/gvko/serverless-p2p-chat.git
```

Import and use:

```
const Chat = require('serverless-p2p-chat');

const chat = new Chat();
await chat.init();

// get other user's pub key
await chat.connectToPeer(pubKey);

// on keypress or other "user is typing" signal
await chat.sendMessage(chat.getKeypressKeyword());

// on new message
await chat.sendMessage(msg);

// on closing the chat from a given client's side
await chat.closeChat();
```

See example usage implementation in `test-chat.js`

## Considerations

The chat lib is encapsulated in a single class `Chat`.

The typing indicator is clumsy and implemented as an incoming message. Tbh, I was looking for a way to send over the
other chat participant some better indicator than a raw message, so that I could print a "typing..." indicator w/o
repeating it. Given more time, I would have come up with a more elegant solution.

The functionality of removing a user from the chat doesn't seem to
work properly. I thought closing the storage session on a given user would do it, but it doesn't seem so.

Also, after there is a chat room established between two users, when a 3rd user joins, he can see the history only of
the last user who joined, and his actions don't affect the chat.

The last two statements could probably be fixed by a more sophisticated structure of the Corestore storage instance. I
was thinking that storing a map of users and their storage instances, and `PeerInfo` (returned when a new swarm
connection by a user is established) would be a possible solution. Since the storage is replicated on new swarm
connections, it could be accessed by any chat instance. Having the `PeerInfo` instance would allow me to `leave`
and `ban` a user. Therefore, the `'kickOutUser` functionality would have probably worked correctly.

I tried subscribing all users joining to the same swarm topic, but that didn't seem to solve the issue with more than 2
users joining the chat not being able to chat.

Tests are definitely a necessary part of the application, but due
to lack of time (in order to fit within the 8h mark), I did not have time to write them.

#### Could have done better

* Implement the possibility for multiple users (more than 2) to join the chat and for it to actually work for the 2+
  users, but not just for the first two.
* The removing of users to function properly
* Proper typing indicator

#### Additional desired features

* Short usernames. Also, to prepend messages with these usernames when showing the messages in the other participants'
  prompts
* Show who is currently typing
* Chat owner, so that only he can remove users from the chat
