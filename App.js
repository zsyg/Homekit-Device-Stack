const chalk = require('chalk');
const Server = require('./core/server');
const Accessory = require('./core/accessory');
const fs = require('fs');
const util = require('./core/util');
const routes = require('./core/routes');
const config = require(process.cwd() + "/config.json");

console.log('\033[2J');

// Check if we are being asked for a Reset.
if(util.checkReset())
{
    return; // stop (whilst we check they know what they are doing.)
}

// Banner
console.log(chalk.keyword('orange')(" HomeKit"))
console.log(chalk.keyword('white')(" Device Stack"))
console.log(chalk.keyword('white')(" "))
console.log(chalk.keyword('white')(" For the Smart Home Enthusiast, For the curious."))
console.log(chalk.keyword('orange')(" _________________________________________________________________"))
console.log(" ")

'use strict'



// Genertae a Bridge and a demo accessory
if (config.bridgeConfig.pincode.length < 10)
{
    config.bridgeConfig.pincode = util.getRndInteger(100, 999) + "-" + util.getRndInteger(10, 99) + "-" + util.getRndInteger(100, 999);
    config.bridgeConfig.username = util.genMAC();
    config.bridgeConfig.setupID = util.makeID(4);
    config.bridgeConfig.serialNumber = util.makeID(12)

    

    util.saveBridgeConfig(config.bridgeConfig)

    // Create a demo accessory for new configs (accessories will heronin be created via the ui)
    const DemoAccessory = {

        "type": "SWITCH",
        "name": "Switch Accessory Demo",
        "description": "An example basic on/off accessory to get you started.",
        "route": "NodeRed",
        "pincode": util.getRndInteger(100, 999) + "-" + util.getRndInteger(10, 99) + "-" + util.getRndInteger(100, 999),
        "username": util.genMAC(),
        "setupID": util.makeID(4),
        "serialNumber": util.makeID(12)
    }

    config.accessories.push(DemoAccessory)
    util.appendAccessoryToConfig(DemoAccessory)

}

// Configure Our Bridge
const Bridge = new Accessory.Bridge(config.bridgeConfig)
Bridge.on('PAIR_CHANGE', Paired)
Bridge.on('LISTENING', getsetupURI)



// Routes
const Routes = {
}
const RouteNames = Object.keys(config.routes);
for(let i=0;i<RouteNames.length;i++)
{
    Routes[RouteNames[i]] = routes[config.routes[RouteNames[i]].type];
}



// Configure Our Acessories 
const Accesories = {
}
for (let i = 0; i < config.accessories.length; i++)
{
    let AccessoryOBJ = config.accessories[i]

    console.log(" Configuring Accessory : " + AccessoryOBJ.name + " (" + AccessoryOBJ.type + ")")
    AccessoryOBJ.accessoryID = AccessoryOBJ.username.replace(/:/g, "");

    switch(AccessoryOBJ.type)
    {
        
       default:
            let Acc = new  Accessory.Types[AccessoryOBJ.type].Object(AccessoryOBJ);
            Acc.on('STATE_CHANGE', (PL,O) =>Change(PL, AccessoryOBJ,O))
            Acc.on('IDENTIFY', (P) =>Identify(P, AccessoryOBJ))
            Accesories[AccessoryOBJ.accessoryID] = Acc;
            Bridge.addAccessory(Acc.getAccessory())
            break;
    }
}


Bridge.publish();

console.log(" Starting web server")
console.log(" ")

// Web Server 
const UIServer = new Server.Server(Accesories,Change,Identify,Bridge);

const BridgeFileName = process.cwd() + "/homekit/AccessoryInfo." + config.bridgeConfig.username.replace(/:/g, "") + ".json";
if (fs.existsSync(BridgeFileName))
{
    const IsPaired = Object.keys(require(BridgeFileName).pairedClients)
    UIServer.setBridgePaired(IsPaired.length>0);
}

// All done.
const Address = chalk.keyword('green')("http://127.0.0.1:" + config.webInterfacePort+"/")

console.log(" "+chalk.black.bgWhite("┌─────────────────────────────────────────────────────────────────────────┐"))
console.log(" " + chalk.black.bgWhite("|    Goto "+Address+" to start managing your installation.     |"))
console.log(" "+chalk.black.bgWhite("|    Default username and password is admin                               |"))
console.log(" " + chalk.black.bgWhite("└─────────────────────────────────────────────────────────────────────────┘"))


process.on('exit', function (code)
{
    console.info('Unpublishing Accessories...')
    Bridge.unpublish(false);
   
});

function getsetupURI(port)
{
  
    config.bridgeConfig.QRData = Bridge.getAccessory().setupURI;
}

function Paired(IsPaired)
{
   
    UIServer.setBridgePaired(IsPaired);
}

function Change(PL, Object,Originator)
{
    const Payload = {
        "accessory": Object,
        "type": "change",
        "change": PL,
        "source":Originator
    }

    //UIServer.push(Payload);
    Routes[Object.route](config.routes[Object.route],Payload);
}

function Identify(paired, Object)
{
    const Payload = {
        "accessory": Object,
        "type": "identify",
        "isPaired": paired,
    }

    Routes[Object.route](config.routes[Object.route],Payload);
}



