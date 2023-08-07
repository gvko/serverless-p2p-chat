const readline = require('readline')

const RAM = require('random-access-memory')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

;(async () => {
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
})()
