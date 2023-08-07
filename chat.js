const RAM = require('random-access-memory');
const Corestore = require('corestore');
const Hyperswarm = require('hyperswarm');

module.exports = class Chat {
  store;
  me;
  them;
  swarm;

  constructor() {
    this.store = new Corestore(RAM);
    this.swarm = new Hyperswarm();
  }

  async init() {
    this.me = this.store.get({name: 'me'});
    await this.me.ready();
    this.swarm.on('connection', connection => this.store.replicate(connection));
    this.swarm.join(this.me.discoveryKey);

    const myKey = this.me.key.toString('hex');
    console.log(`My key: ${myKey}`);
    return myKey;
  }

  async connectToPeer(theirKey) {
    this.them = this.store.get(Buffer.from(theirKey, 'hex'));
    await this.them.ready();

    this.swarm.join(this.them.discoveryKey);
    await this.swarm.flush();

    this.them.createReadStream({live: true}).on('data', data => console.log('<', data.toString()));
    console.log('Chat away!')
  }

  async sendMessage(message) {
    await this.me.append(message);
  }

  async closeChat() {
    console.log('Closing chat...');
    await this.me.session().close();
    await this.them.session().close();
    await this.me.close();
    await this.them.close();
  }
}

async function old() {
  const store = new Corestore(RAM)
  const me = store.get({name: 'me'})
  await me.ready()

  const swarm = new Hyperswarm()
  swarm.on('connection', conn => store.replicate(conn))
  swarm.join(me.discoveryKey)

  console.log('my key', me.key.toString('hex'))

  rl.question('paste their public key: ', async (pK) => {
    let them = store.get(Buffer.from(pK, 'hex'))
    await them.ready()

    swarm.join(them.discoveryKey)
    await swarm.flush()

    them.createReadStream({live: true}).on('data', data => console.log('<', data.toString()))

    console.log('Chat away!')
    rl.on('line', async line => await me.append(line))

    rl.on('close', async () => {
      console.log('Bye!')
      await me.session().close()
      await them.session().close()
      await me.close()
      await them.close()
    })
  })
}
