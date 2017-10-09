const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("chat.db");
const Long = require('long');

const Discord = require('discord.js');
const client = new Discord.Client();

const CredInfo = require("./cred.js");

const SFUtil = require("./sfutil.js");

client.login(CredInfo.API_KEY);

client.on("ready", () => {
    return;
    try {
        channels = client.guilds.array().filter(a => {
            return a.id == 361847638833758219;
        })[0].channels.array().filter(a => {
            return a.type == "text"
        });
        //	db.run("delete from channel");
        for (var i in channels) {
            var channel = channels[i]
            db.run("insert into channel values (?, ?)", channel.id, channel.name, (e) => {
                if (e && e.code != "SQLITE_CONSTRAINT") {
                    throw e;
                }
            });
            /*
            		((i) => {

            			channels[i].fetchMessages({limit: 1}).then(messages => {
            				var messages = messages.array()
            				for (var j in messages) {
            					console.log(messages[j].channel.name, messages[j].cleanContent);
            				}
            			}).catch(() => {
            				console.log("No permission for channel " + channels[i].name);
            			})
            		})(i)
            */
        }
    } catch (e) {

    }
})
