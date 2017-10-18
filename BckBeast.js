const fs = require('fs');
const os = require('os');
const http = require("http");
const https = require("https");
const vorpal = require('vorpal')();
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("chat.db");

const CredInfo = require("./cred.js");

const Discord = require('discord.js');
const client = new Discord.Client();

client.login(CredInfo.API_KEY);

const logfile = "logs/BckBeast.log";

function quit() {
    client.destroy();
    console.log("Bot closed.");
    process.exit();
}

function report(msg) {
    var txt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    txt = txt + "\t" + msg;
    vorpal.log(txt);
    fs.appendFile(logfile, txt + "\n", () => {})
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

vorpal.mode('eval').delimiter('<eval>').description("Enter evaluation mode.").init((a, cb) => {
    vorpal.log("You are now in evaluation mode.\n Type `exit` to exit.")
    cb();
}).action((a, cb) => {
    try {
        vorpal.log(eval(a));
        cb();
    } catch (e) {
        vorpal.log(e.toString())
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

    client.guilds.array()[1].channels.find("name", "general").fetchMessages({before: 363837417062531073}).then(a => {console.log(a.array().length)})
*/


client.on('message', message => {
    /*    if (message.channel.guild.id != "342372275305054210") {
            return;
        }*/
    if (message.author != client.user) {
        global.message = message;
    }
    try {
        var authorNick = message.channel.members.find("user", message.author).nickname
        if (authorNick == null) throw e;
    } catch (e) {
        var authorNick = message.author.username;
    } finally {
        report(message.channel.name + " => " + authorNick + ": " + message.cleanContent);
    }
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

            break;
        default:
            break;
    }
    db.run("insert into message values (?, ?, ?, ?)", message.id, message.cleanContent, authorNick, message.channel.id, (e) => {
         var attachments = message.attachments.array();
         if (attachments.length) {
             for (var a in attachments) {
                 db.run("insert into attachment values (?, ?)", message.id, a.url, (e) => {});
             }
         }
    });
});
