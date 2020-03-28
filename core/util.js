'use strict'
const fs = require('fs');
const readline = require("readline");
const chalk = require('chalk');

const getRndInteger = function (min, max)
{
    return Math.floor(Math.random() * (max - min)) + min;
}
const genMAC = function ()
{
    var hexDigits = "0123456789ABCDEF";
    var macAddress = "";
    for (var i = 0; i < 6; i++)
    {
        macAddress += hexDigits.charAt(Math.round(Math.random() * 15));
        macAddress += hexDigits.charAt(Math.round(Math.random() * 15));
        if (i != 5) macAddress += ":";
    }

    return macAddress;
}
const makeID = function (length)
{
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++)
    {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



/**
 * Config file management feels really messy currently.
 */
const appendAccessoryToConfig = function(Accessory)
{
    const CFF = fs.readFileSync(process.cwd() + "/config.json", 'utf8');
    const ConfigOBJ = JSON.parse(CFF);

    ConfigOBJ.accessories.push(Accessory);

    saveConfig(ConfigOBJ);

}
/**
 * Config file management feels really messy currently.
 */
const editAccessory = function(Accessory, username)
{
    const CFF = fs.readFileSync(process.cwd() + "/config.json", 'utf8');
    const ConfigOBJ = JSON.parse(CFF);

  
    const TargetAc = ConfigOBJ.accessories.filter(a => a.username == username)[0]
   

    const Keys = Object.keys(Accessory);

    for(let i = 0;i<Keys.length;i++)
    {
        if(TargetAc.hasOwnProperty(Keys[i]))
        {
            TargetAc[Keys[i]] = Accessory[Keys[i]];
        }
    }

   

    saveConfig(ConfigOBJ);
  

}
/**
 * Config file management feels really messy currently.
 */

const saveBridgeConfig = function(config)
{
    const CFF = fs.readFileSync(process.cwd() + "/config.json", 'utf8');
    const ConfigOBJ = JSON.parse(CFF);

    ConfigOBJ.bridgeConfig = config;

    saveConfig(ConfigOBJ);
}

const saveConfig = function(config)
{
    fs.writeFileSync(process.cwd() + "/config.json", JSON.stringify(config), 'utf8', function (err)
    {
        if (err)
        {
            console.log('Could not create config file')
        }
        
    })
}

/**
 * Reset Configuration, Reset Homekit - nuke the whole lot!!
 */

const _deleteFolderRecursive = function (path)
{
    if (fs.existsSync(path))
    {
        fs.readdirSync(path).forEach(function (file, index)
        {
            const curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory())
            {
                deleteFolderRecursive(curPath);
            }
            else
            {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

const checkReset = function ()
{
    if (process.argv.length > 2)
    {
        if (process.argv[2] == "Reset")
        {


            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            console.log(chalk.keyword('yellow')(" -- WARNING --"))
            console.log('')
            console.log(chalk.keyword('yellow')(" HomeKit Device Stack is about to be RESET!!."))
            console.log(chalk.keyword('yellow')(" This will."))
            console.log('')
            console.log(chalk.keyword('yellow')(" - Delete all your Accessories (Including any CCTV Cameras)."))
            console.log(chalk.keyword('yellow')(" - Destroy the Bridge hosting those Accessories."))
            console.log(chalk.keyword('yellow')(" - Delete all HomeKit cache data."))
            console.log(chalk.keyword('yellow')(" - Delete all HomeKit Device Stack Configuration."))
            console.log(chalk.keyword('yellow')(" - Discard any Accessory identification."))
            console.log(chalk.keyword('yellow')(" - Reset the login details for the UI."))
            console.log('')
            console.log(chalk.keyword('yellow')(" Evan if you recreate Accessories, you will need to re-enroll HomeKit Device Stack on your iOS device."))
            console.log('')

            rl.question(" Continue? (y/n) :: ", function (value)
            {
                if (value.toUpperCase() == 'Y')
                {
                    console.log('')
                    Reset();
                    console.log(' Homekit Device Stack has been reset.');
                    console.log('')
                    process.exit(0);

                }
                else
                {
                    process.exit(0);
                }

            });

            return true
        }
        else{
            return false;
        }
    }
}

const Reset = function ()
{
    const Config = {
        "loginUsername": "admin",
        "loginPassword": "21232f297a57a5a743894a0e4a801fc3",
        "wsCommPort": 7990,
        "webInterfacePort": 7989,
        "bridgeConfig": {
            "pincode": "",
            "username": "",
            "setupID": "",
            "serialNumber": ""
        },
        "routes": {
            "NodeRed": {
                "type": "HTTP",
                "destinationURI": "http://10.0.0.2:1880/HKDS",
                "method": "POST"
            }
        },
        "accessories": []
    }
    console.log(' Clearing Configuration')

    fs.unlinkSync(process.cwd() + "/config.json");
    
    fs.writeFileSync(process.cwd() + "/config.json", JSON.stringify(Config), 'utf8', function (err)
    {
        if (err)
        {
            console.log('Could not create config file')
        }
        
    })

    console.log(' Wiping HomeKit cache.')
    _deleteFolderRecursive(process.cwd() + "/homekit")

}

module.exports = {
    getRndInteger: getRndInteger,
    genMAC: genMAC,
    makeID: makeID,
    saveConfig: saveConfig,
    appendAccessoryToConfig:appendAccessoryToConfig,
    checkReset:checkReset,
    editAccessory:editAccessory,
    saveBridgeConfig:saveBridgeConfig
}
