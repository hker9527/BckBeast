const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("chat.db");
const Long = require('long');

const Discord = require('discord.js');
const client = new Discord.Client();

const CredInfo = require("./cred.js");

const SFUtil = require("./sfutil.js");

client.login(CredInfo.API_KEY);

function report (msg) {
    return process.stdout.write(msg + " ".repeat(process.stdout.columns - msg.length - 2) + "\r")
}

client.on("ready", () => {
    channels = client.guilds.find("id", "361847638833758219").channels.array().filter(a => {
        return a.type == "text"
    });
    //	db.run("delete from channel");
    var doneCH = 0;
    setInterval(() => {
        report("Total progress:" + doneCH + " / " + channels.length + "\n");
        if (doneCH == channels.length) {
            process.exit();
        }
    }, 1000);
    for (var i in channels) {
        var channel = channels[i]
        db.run("insert into channel values (?, ?)", channel.id, channel.name, (e) => {
            if (e && e.code != "SQLITE_CONSTRAINT") {
                throw e;
            }
        });
        report("Parsing channel:" + channel.name);
        (channel => {
            db.get("select id from message where channel_id = ? order by id limit 1", channel.id, (e, d) => {
                if (!d) {
                    var until = SFUtil.gen();
                } else {
                    until = d.id
                }
                ((c, u) => {
                    c.fetchMessages({
                        before: u,
                        limit: 100
                    }).then((msgs) => {
                        var _msgs = msgs.array()
                        var _m = 0;
                        for (var m in _msgs) {
                            var msg = _msgs[m];
                            try {
                                var authorNick = msg.channel.members.find("user", msg.author).nickname
                                if (authorNick == null) throw e;
                            } catch (e) {
                                var authorNick = msg.author.username;
                            } finally {
                                db.run("insert into message values (?, ?, ?, ?)", msg.id, msg.cleanContent, authorNick, c.id, (e) => {
                                    var attachments = msg.attachments.array();
                                    if (attachments.length) {
                                        for (var a in attachments) {
                                            db.run("insert into attachment values (?, ?)", msg.id, a.url, (e) => {
                                                report("Progress for " + c.name + ": " + ++_m + " / " + _msgs.length);
                                            });
                                        }
                                    } else {
                                        report("Progress for " + c.name + ": " + ++_m + " / " + _msgs.length);
                                    }
                                });
                            }
                        }
                        doneCH++;
                    }).catch((e) => {
                        report("Request error: " + c.name + " " + e.toString() + "\n");
                    })
                    report("Sent request: " + c.name);
                })(channel, until);
            })
        })(channel);
    }
})
