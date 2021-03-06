'use strict';

const fs = require('fs');
const heapdump = require('heapdump');
const MempoolEntry = require('../lib/mempool/mempoolentry');
const Coins = require('../lib/coins/coins');
const TX = require('../lib/primitives/tx');
const CoinView = require('../lib/coins/coinview');

const SNAPSHOT = `${__dirname}/../dump.heapsnapshot`;
const tx = parseTX('../test/data/tx4.hex');

function parseTX(file) {
  const data = fs.readFileSync(`${__dirname}/${file}`, 'utf8');
  const parts = data.trim().split(/\n+/);
  let raw = parts[0];
  const tx = TX.fromRaw(raw.trim(), 'hex');
  const view = new CoinView();
  let i, prev;

  for (i = 1; i < parts.length; i++) {
    raw = parts[i];
    prev = TX.fromRaw(raw.trim(), 'hex');
    view.addTX(prev, -1);
  }

  return { tx: tx, view: view };
}

const raw = Coins.fromTX(tx.tx, 0).toRaw();
const coins = Coins.fromRaw(raw, tx.tx.hash('hex'));
const entry = MempoolEntry.fromTX(tx.tx, tx.view, 1000000);

setInterval(() => {
  console.log(tx.hash('hex'));
  console.log(coins.hash);
  console.log(entry.tx);
}, 60 * 1000);

setImmediate(() => {
  heapdump.writeSnapshot(SNAPSHOT, (err) => {
    if (err)
      throw err;
  });
});
