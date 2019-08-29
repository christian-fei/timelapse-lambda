'use strict'

const main = require('.')

exports.handler = function ({ bucket = 'snapshots', name = 'timelapse.mp4', amount = 24, fps = 6 }, context, cb) {
  main.downloadS3Images({ bucket, amount })
    .then(() => main.createTimelapse({ name, fps }))
    .then(() => main.saveTimelapseToS3({ bucket, name }))
    .then((data) => cb(null, { success: true, data, bucket, name, amount, fps }))
    .catch(err => cb(err))
}
