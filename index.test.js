const tap = require('tap')
const { timelapsePathFor } = require('.')
tap.pass('this is fine')

tap.test('timelapsePathFor - get tmp path for filename', (t) => {
  t.plan(1)
  const timelapsePath = timelapsePathFor('timelapse.mp4')
  t.deepEqual('/tmp/timelapse.mp4', timelapsePath)
})
