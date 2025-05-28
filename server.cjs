const express = require('express');
const app = express();
const cors = require('cors');
const { setupSocket } = require('./socket.cjs');
const pool = require('./accounts.cjs').pool;
const createUser = require('./accounts.cjs').createUser;
const getUserByUsername = require('./accounts.cjs').getUserByUsername;
const updateAvatarUrl = require('./accounts.cjs').updateAvatarUrl;
const updatePrefColor = require('./accounts.cjs').updatePrefColor;
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// 1) load env
const dotenv = require('dotenv');
dotenv.config();

// 2) aws & multer setup
const AWS = require('aws-sdk');
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// 3) configure S3 client
AWS.config.update({
  region: process.env.AWS_REGION,
  signatureVersion: 'v4'
});
const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const server_port = 3001;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = app.listen(server_port, () => {
    console.log('listening on : ' + server_port);
});

// Pass the server to the socket logic
setupSocket(server);


app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required.' });
    }
    createUser(username.trim(), email.trim(), password.trim())
        .then(userId => res.status(201).json({ userId }))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        });
    
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }
    
    getUserByUsername(username.trim())
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }
            bcrypt.compare(password.trim(), user.password_hash)
                .then(match => {
                    if (match) {
                        const {password_hash,created_at, updated_at, ...authedUser} = user;
                        res.json(authedUser);
                    } else {
                        res.status(401).json({ error: 'Invalid username or password.' });
                    }
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        });
});

// NEW: simple S3 upload function
async function uploadFileToS3({ fileBuffer, fileName, folder, mimetype }) {
    const key = `${folder}/${Date.now()}_${fileName}`;
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
        ACL: 'public-read'
    };

    try {
        const { Location } = await s3.upload(params).promise();
        return { imageUrl: Location, key };
    } catch (err) {
        console.error('S3 upload error:', err);
        throw err;
    }
}

// Route for uploading files and sending messages
app.post('/profile-pic', upload.single('file'), async (req, res) => {
    const { username } = req.body;
    if (!req.file || !username) {
        return res.status(400).json({ error: 'File and username are required.' });
    }

    try {
        const folder = `profiles/${username.trim()}`;
        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const mimetype = req.file.mimetype;

        const result = await uploadFileToS3({ fileBuffer, fileName, folder, mimetype });
        if (!result || !result.imageUrl) {
            return res.status(500).json({ error: 'Upload failed.' });
        }
        console.log(`File uploaded successfully: ${result.imageUrl}`);
        try {
            await updateAvatarUrl(username.trim(), result.imageUrl);
            console.log(`Avatar URL updated for ${username}: ${result.imageUrl}`);
        } catch (err) {
            console.error('Error updating avatar URL:', err);
        }
        res.json({ imageUrl: result.imageUrl, key: result.key });
    } catch (err) {
        res.status(500).json({ error: 'Upload failed.' });
    }
});

app.post('/color-change', async (req, res) => {
    const { username, color } = req.body;
    if (!username || !color) {
        return res.status(400).json({ error: 'Username and color are required.' });
    }
    try {
        await updatePrefColor(username.trim(), color.trim());
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating preferred color:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});






