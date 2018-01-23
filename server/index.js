const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3001;

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'localhost');
    next();
});

const initialKaladontState = {
    lastClientId: null,
    lastWord: ''
};
const kaladontState = { ...initialKaladontState };

const antiSpamBotMsg = {
    userName: 'Anti-spam Bot',
    message: 'Ne možeš slati dva odgovora za redom!',
    color: '#000'
};

const baseKaladontRulesBot = {
    userName: 'Kaladont Rules Bot',
    color: '#111111'
};
const kaladontRules = [
    {
        test: (msg) => !(!msg.message || msg.message.length < 4),
        botMsg: {
            ...baseKaladontRulesBot,
            message: 'Riječ mora sadržavati barem 4 slova!'
        }
    },
    {
        test: (msg) => (kaladontState.lastWord === initialKaladontState.lastWord)
                        || (msg.message.toLowerCase().slice(0, 2) === kaladontState.lastWord.slice(-2)),
        botMsg: {
            ...baseKaladontRulesBot,
            message: 'Riječ mora započeti s posljednja dva slova prethodne riječi!'
        }
    }
];
const gameOver = {
    isGameOver: (msg) => (msg.message.toLowerCase().slice(-2) === 'nt'),
    gameOverBotMsg: (msg) => ({
        userName: 'Game Over Bot',
        color: '#fff500',
        message: `Igra je gotova, ${msg.userName} je pobjedio/la!!!`
    })
};

const msgWithDate = (msg) => ({ ...msg, date: new Date() });

io.on('connection', function (socket) {
    console.log('connected: ', socket.client.id);

    socket.on('message', function (msg) {
        console.log(this.client.id, msg);

        if (kaladontState.lastClientId === this.client.id.toString()) {
            // spam message (player must wait his/her turn)
            io.to(this.id).emit('message', msgWithDate(antiSpamBotMsg));
        } else if (kaladontRules.some((_rule) => !_rule.test(msg))) {
            // rule broken
            io.to(this.id).emit('message', msgWithDate(kaladontRules.find((_rule) => !_rule.test(msg)).botMsg));
        } else if (gameOver.isGameOver(msg)) {
            // game over => reset game state and notify players
            kaladontState.lastClientId = initialKaladontState.lastClientId;
            kaladontState.lastWord = initialKaladontState.lastWord;
            io.emit('message', msgWithDate(gameOver.gameOverBotMsg(msg)));
        } else {
            // standard action
            kaladontState.lastClientId = this.client.id;
            kaladontState.lastWord = msg.message.toLowerCase();
            io.emit('message', msgWithDate(msg));
        }

        console.info(kaladontState);
    });

    socket.on('disconnect', () => {
        console.log('disconnected: ', socket.client.id);
    });
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});