const Readline = require('readline');
const Chat = require('./chat');

async function main() {
  const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const chat = new Chat();
  const myKey = await chat.init();

  readline.question('Paste other user\'s key: ', async (pubKey) => {
    await chat.connectToPeer(pubKey);

    readline.on('line', async (msg) => {
      await chat.sendMessage(msg);
    });

    readline.on('close', async () => {
      await chat.closeChat();
      process.exit(0);
    })
  });
}

main();
