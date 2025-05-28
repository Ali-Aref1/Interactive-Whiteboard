const express = require('express');
const app = express();
const cors = require('cors');
const { setupSocket } = require('./socket.cjs');
const pool = require('./accounts.cjs').pool;
const createUser = require('./accounts.cjs').createUser;
const getUserByUsername = require('./accounts.cjs').getUserByUsername;
const bcrypt = require('bcrypt');

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
                        res.json({ id: user.id, username: user.username, email: user.email });
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
