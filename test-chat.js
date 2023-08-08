const Readline = require('readline');
const Chat = require('./chat');

async function main() {
  const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const chat = new Chat();
  await chat.init();

  readline.question('Paste other user\'s key: ', async (pubKey) => {
    await chat.connectToPeer(pubKey);

    // process.stdin.on('keypress', async () => {
    //   await chat.sendMessage('typing...');
    // });

    readline.on('line', async (msg) => {
      if (msg.includes('ban')) {
        const userToBanPubKey = msg.split(' ')[1];
        await chat.kickOutUser(userToBanPubKey);
      }

      await chat.sendMessage(msg);
    });

    readline.on('close', async () => {
      await chat.closeChat();
      process.exit(0);
    })
  });
}

main();
