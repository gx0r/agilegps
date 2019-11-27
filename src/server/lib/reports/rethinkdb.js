
// TODO make reports run diretly on the DB

const r = require("../../../common/db");

(async () => {
  // const results = await r.db('agilegps');

  const results = await r.db('agilegps')
    .table('vehiclehistory')
    .between(r.time(2019, 1, 1, 'Z'), r.now(), {
      index: "d",
      leftBound: "closed",
      rightBound: "open"
    })
    .filter(r.row('vid').eq('beae911f-56e7-44eb-91a1-8b2e7daa0f89'))
    .filter(r.row('la').ne(null))
    .filter(r.row('lo').ne(null))
    .map(function (val) { // clean data
      if (val.last && val.last.cmd === "TOW") {
          val.last.ig = false;
          val.lastmo = true;
      } else if (val.cmd === "TOW") {
          val.ig = false;
          val.mo = true;
      }
      return val;
    })
    .fold([], function (acc, cur) {
      // return r.branch(
      //   acc.isEmpty(),
      //   acc.add([doc]),
      //   acc.nth(-1)('transaction_type').eq(doc('transaction_type')),
      //   acc.slice(0, -1).append(acc.nth(-1).merge({
      //       amount: acc.nth(-1)('amount').add(doc('amount'))
      //   })),
        return acc.add([cur])
      // );
    }, {emit: (prev, cur, ytd) => [ytd]})

  console.log(results);
  
  await r.getPoolMaster().drain();
})();
