const express      = require('express'),
      app          = express(),
      port         = process.env.PORT || 3000,
      mongoose     = require('mongoose'),
      passport     = require('passport'),
      flash        = require('connect-flash'),
      morgan       = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser   = require('body-parser'),
      session      = require('express-session'),
      config_db    = require('./config/DB'),
      socket       = require('socket.io'),
      chats        = require('./app/models/converstation');


mongoose.connect(config_db.DB_url, { useMongoClient: true });

require('./config/passport')(passport);
app.use('/public', express.static('public'));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'formulaspecnaz1alonsonoejsblablabla', // session secret
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes.js')(app, passport);
const server = app.listen(port, function () {
   console.log('Listening to requests on port 3000');
});
function retrieveChat(author, receiver, callback) {
    chats.find({author: author, to: receiver}, function (err, _chat) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, _chat);
        }
    });
}
Array.prototype.removeByName = function (element) {
    const index = this.indexOf(element);
    if (index !== -1) {
        this.splice(index, 1);
    }

    return this;
};
Array.prototype.concatObject = function (arr) {
    for (let i of arr) {
        this.push(i);
    }

    return this;
};

const io             = socket(server);
let   clients        = [],
      active_users   = [],
      private_chat_1 = {},
      private_chat_2 = {},
      chat_opened    = false;

io.on('connection', function(socket) {
    console.log('made socket connection');
    socket.on('get-username', function (user) {
        clients[user.username] = {
            "socket": socket.id
        };
        let check_user = false;
        Array.from(new Set(active_users)).map(function (act_user) {
            if(act_user === user.username) {
                check_user = true;
                return 0;
            }
         });
        if(!check_user) {
            socket.broadcast.emit('show-active-user', user.username);
        }
        socket.username = user.username;
        socket.emit('show-all-active-users', active_users.removeByName(socket.username));
        active_users.push(user.username);
    });
    socket.on('disconnected-user', function () {
        active_users.removeByName(socket.username);
        socket.broadcast.emit('show-updated-active-users', socket.username);
    });
    socket.on('get-chat', function (data) {

        if (data.to !== '') {
            retrieveChat(data.username, data.to, function(err, _chat) {
                if (err) {
                    console.log(err);
                }
                private_chat_1 = _chat;
                retrieveChat(data.to, data.username, function(err, _chat) {
                    if (err) {
                        console.log(err);
                    }
                    private_chat_2 = _chat;
                    let _CHAT_ = private_chat_1.concatObject(private_chat_2).sort(function (a, b) {
                        return a.date.getTime() - b.date.getTime();
                    });
                    io.sockets.connected[clients[data.username].socket].emit('show-chat-history', _CHAT_);
                });
            });
        }
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
        chat_opened = false;
    });
    socket.on('chat', function(data) {
        const new_chat = new chats({
            author : data.username,
            to     : data.to,
            body   : data.content,
            date   : new Date()
        });
        if(data.to !== '' && data.content !== '') {
            new_chat.save(function (err) {
                if (err) {
                    console.log(err);
                }
            });
            if (!chat_opened) {
                io.sockets.connected[clients[data.username].socket].emit('show-msg', data);
                retrieveChat(data.username, data.to, function (err, _chat) {
                    if (err) {
                        console.log(err);
                    }
                    private_chat_1 = _chat;
                    retrieveChat(data.to, data.username, function (err, _chat) {
                        if (err) {
                            console.log(err);
                        }
                        private_chat_2 = _chat;
                        let _CHAT_ = private_chat_1.concatObject(private_chat_2).sort(function (a, b) {
                            return a.date.getTime() - b.date.getTime();
                        });
                        io.sockets.connected[clients[data.to].socket].emit('show-chat-history', _CHAT_);
                        io.sockets.connected[clients[data.to].socket].emit('show-msg', data);
                    });
                    chat_opened = true;
                });
            } else {
                console.log('Not searching chat history.');
                io.sockets.connected[clients[data.to].socket].emit('show-msg', data);
                io.sockets.connected[clients[data.username].socket].emit('show-msg', data);
            }
        }
    });
});



