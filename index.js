exports.timelapsePathFor = timelapsePathFor
exports.downloadS3Images = downloadS3Images
exports.createTimelapse = createTimelapse
exports.saveTimelapseToS3 = saveTimelapseToS3

const { promisify } = require('util')
const fs = require('fs')
const writeFile = promisify(fs.writeFile).bind(fs)
const ffmpeg = require('fluent-ffmpeg')

const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const listObjects = promisify(S3.listObjects).bind(S3)
const getObject = promisify(S3.getObject).bind(S3)
const putObject = promisify(S3.putObject).bind(S3)

function timelapsePathFor (name) { return `/tmp/${name}` }

function downloadS3Images ({ bucket, amount } = {}) {
  if (!bucket) throw new Error('bucket missing')
  return listObjects({ Bucket: bucket })
    .then(data => {
      const files = data.Contents
        .filter(d => d.Key.startsWith('201'))
        .filter((d, i) => i > (data.Contents.length - 1 - amount)).map(d => d.Key)

      return Promise.all(files.map(file => getObject({ Bucket: bucket, Key: file })))
    })
    .then(files => Promise.all(files.map((file, i) => writeFile(`/tmp/${i}.jpg`, file.Body))))
}

function createTimelapse ({ name, fps } = {}) {
  const timelapsePath = timelapsePathFor(name)
  return new Promise((resolve, reject) => {
    ffmpeg().addInput('/tmp/%01d.jpg').noAudio().outputOptions(`-r ${fps}`).videoCodec('libx264')
      .on('error', (err) => { console.error('Error during processing', err); reject(err) })
      .on('end', () => { console.log('Processing finished !'); resolve() })
      .save(timelapsePath, { end: true })
  })
}

function saveTimelapseToS3 ({ bucket, name }) {
  const timelapsePath = timelapsePathFor(name)
  return putObject({ Body: fs.readFileSync(timelapsePath), Bucket: bucket, Key: name })
}