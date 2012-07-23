var helper = require(__dirname + "/../test-helper");
var pg = require(__dirname + "/../../../lib");
helper.pg = pg;

helper.pg.defaults.poolSize = 1;

test('aborted transaction returned to pool', function() {
  helper.pg.connect(helper.config, assert.success(function(client) {
    client.id = 1;
    client.pauseDrain();
    client.query('begin;', assert.success(function() {
      // client.query('rollback;'); // <-- This causes the test to pass.
      client.query('select * from thistableshouldneverexist', function(err) {
        assert.ok(err);
        client.resumeDrain();
        helper.pg.connect(helper.config, assert.success(function(client) {
          assert.equal(client.id, 1);
          client.query("select * from person", assert.success(function(result) {
            console.log('Ending', result);
            helper.pg.end();
          }));
        }));
      });
    }));
  }));
});