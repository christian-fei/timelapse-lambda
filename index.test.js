const tap = require('tap')
const sinon = require('sinon')
const { timelapsePathFor, downloadS3Images } = require('.')
tap.pass('this is fine')

tap.test('timelapsePathFor - get tmp path for filename', (t) => {
  t.plan(1)
  const timelapsePath = timelapsePathFor('timelapse.mp4')
  t.deepEqual('/tmp/timelapse.mp4', timelapsePath)
})

tap.test('downloadS3Images - saves snapshots in bucket to disk', async (t) => {
  const listObjects = sinon.spy(() => Promise.resolve({ Contents: [{ Key: '2019-08-30T17:37:33.540Z.jpg' }] }))
  const getObject = sinon.spy(({ Bucket, Key }) => Promise.resolve({ Body: '...' }))
  const writeFile = sinon.spy((path, contents) => Promise.resolve())

  await downloadS3Images({ bucket: 'snapshots', amount: 1 }, { listObjects, getObject, writeFile })

  t.true(listObjects.calledWithExactly({ Bucket: 'snapshots' }))
  t.true(getObject.calledWithExactly({ Bucket: 'snapshots', Key: '2019-08-30T17:37:33.540Z.jpg' }))
  t.true(writeFile.calledWithExactly('/tmp/0.jpg', '...'))
})
