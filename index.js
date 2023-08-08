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
    if (message === this.getKeypressKeyword()) {
      await this.me.append('typing...');
    } else {
      await this.me.append(message);
    }
  }

  async closeChat() {
    console.log('Closing chat...');
    await this.me.session().close();
    await this.them.session().close();
    await this.me.close();
    await this.them.close();
  }

  async kickOutUser(pubKey) {
    const userToBan = this.store.get(Buffer.from(pubKey, 'hex'));
    await userToBan.session().close();
    await userToBan.close();
    console.log(`Banned ${pubKey}`);
  }

  getKeypressKeyword() {
    return 'user-is-typing-4a516b871f66990bd2a1fcc5a07dfcbf874b22299298ca462b9f76f62a6bc992';
  }
}
