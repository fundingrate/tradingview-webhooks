const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

module.exports = config => {

  // Set S3 endpoint to DigitalOcean Spaces
  const spacesEndpoint = new aws.Endpoint('nyc3.digitaloceanspaces.com');
  const s3 = new aws.S3({
    endpoint: spacesEndpoint
  });

  // Change bucket property to your Space name
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'your-space-here',
      acl: 'public-read',
      key: function (request, file, cb) {
        console.log(file);
        cb(null, file.originalname);
      }
    })
  }).array('upload', 1);

  return () => {
    
  }
}