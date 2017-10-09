const fs = require('fs');
const os = require('os');
const http = require("http");
const https = require("https");
const vorpal = require('vorpal')();
const sqlite3 = require("sqlite3");

const CredInfo = require("./cred.js");

const Discord = require('discord.js');
const client = new Discord.Client();

client.login(CredInfo.API_KEY);

function quit() {
    client.destroy();
    console.log("Bot closed.");
    process.exit();
}

function report(msg) {
    var txt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    txt = txt + "\t" + msg;
    vorpal.log(txt);
    return true;
}

client.on('ready', () => {
    vorpal.delimiter('> ').show();
    report('I am ready!');
    global.channels = client.guilds.array().filter(a => {
        return a.id == 361847638833758219;
    })[0].channels.array().filter(a => {
        return a.type == "text"
    });

    global.channelName = channels.map(a => {
        return a.name;
    });
});

vorpal.command('echo <var...>', 'echo variable value.').action((args, cb) => {
    try {
        var _var = args.var
        for (var a in _var) {
            if (_var[a].indexOf("(") > 0) {
                vorpal.log(_var[a])
            }
            vorpal.log(eval(_var[a]));
        }
        cb();
    } catch (e) {
        report(e.toString())
    }
});
// [ '361847638833758219', '342372275305054210' ]
/*
    message.edits[n] // Same as message, with version backtrace
        -> attachments
            -> filename
            -> filesize
            -> url
        -> author
            -> username
        -> channel
            -> fetchMessages()
                {} limit
                {} before
                {} after
        -> cleanContent
        -> created

*/


client.on('message', message => {
    /*    if (message.channel.guild.id != "342372275305054210") {
            return;
        }*/
    if (message.author != client.user) {
        global.message = message;
    }
    report(message.author.username + ": " + message.content);
    var msg = message.content.split(" ");
    switch (msg[0]) {
        case "b!ping":
            message.reply("pong!");
            break;
        case "b!list":

            var txt = "";
            for (var i in channelName) {
                txt = txt + i + ": " + channelName[i] + "\n";
            }
            message.channel.send("```\n" + txt + "```");
            break;
        case "b!export":
            /*if (msg.length < 4) {
                message.channel.send("!export [channelID] [from] [to]")
            }*/
            var channelIndex = parseInt(msg[1]);
            var from = 1506965765650
            var to = 1506965844806
            var channel = channelName[channelIndex];
            message.reply()
            // use SQL table to store
            function findMessage(from = null, to = null) {
                var msgs = channel.fetchMessages({
                    limit: 100
                }).then(messages => {
                    for (var i in messages) {
                        if (messages[i].createdTimestamp < to) {
                            global.msgTo = messages[i];
                        }
                    }
                    return findMessage()
                })
            }



            break;
        default:
            break;
    }
});
