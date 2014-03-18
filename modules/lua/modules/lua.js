// Lua Module
// It requires nodelua to be installed, or it will fail.

var lua = [];
var nodelua;
var botconf;
var bot;
var ret_value, error;
var err_length;
function setupLua(instanceName) {
	nodelua = require("nodelua");
	lua[instanceName] = NaN;
	lua[instanceName] = new nodelua.LuaState(instanceName);
	lua[instanceName].registerFunction("nativeP", function(to, str){
                bot.say(to, "> "  + str);
    });
    lua[instanceName].registerFunction("sayIRC", function(user, message){
                bot.say(user, message);
    });
	lua[instanceName].registerFunction("actionIRC", function(channel, message) {
				bot.action(channel, message);
	});
	lua[instanceName].registerFunction("joinIRC", function(channel) {
				bot.join(channel);
	});
	lua[instanceName].registerFunction("partIRC", function(channel) {
				bot.part(channel);
	});
	lua[instanceName].registerFunction("resetLua", function() {
				printAllowed = false;
				setupLua(bot, config);
	});
	lua[instanceName].registerFunction("nope", function(to) {
				bot.say(to, "Nope!")
	});
}

function runLuaCMD(to, instanceName, command) {
	try	{
		lua[instanceName].doStringSync(
	        
	      	"debug.sethook(function() error(\"Quota exceeded\", 3) end, \"\", 500000); " +
      	  	"print = function(str) return nativeP(\"" + to + "\", str); end; " +
			"os.exit = function() return nope(\"" + to + "\"); end; " +
			"os.execute = function() return nope(\"" + to + "\"); end; " +
			"os.remove = function() return nope(\"" + to + "\"); end; " +
			"os.rename = function() return nope(\"" + to + "\"); end; " +
			"io = nil; require = nil; module = nil; dofile = nil; loadfile = nil;"
	    );
	} catch (err) {
		// bot.say(to, "Lua Crashed, making State Reset...");
		setupLua(instanceName);
	}
	ret_value;
    var ret_value, error;
	try {
        ret_value = lua[instanceName].doStringSync(command);
    } catch (err) {
		error = err;
    }
    if (ret_value) {
    	var retstr = "";
		for (i in ret_value) {
		   retstr += ret_value[i] + "\n";
		};
		return retstr;
    } else if (error) {
        return error

    }
}

function start(from,to,msgto,botorig,config,echexecargs) {
	// Nothing
}

function autoload(botorig,config) {
	bot = botorig;
	console.log("lua.js started automatically");
	setupLua("lua");
	botconf = config;
	bot.addListener("message", function(from, to, text, message){
		if (text.startsWith("->")) {
			var msgto;
			if (to != config.nick) msgto=to; else msgto=from;
			var luaStr = text.substring(2).trim();
			var returned = runLuaCMD(msgto, "lua", luaStr);
			bot.say(msgto, returned);
		};

	});
}

String.prototype.startsWith = function(prefix) { // Thanks again Sorroko!
        return this.indexOf(prefix) === 0;
}

function execute() {
	// Nothing
}
exports.start = start;
exports.execute = execute;
exports.autoload = autoload;
exports.runLuaCMD = runLuaCMD;
exports.setupLua = setupLua;
exports.luaInstances = lua;