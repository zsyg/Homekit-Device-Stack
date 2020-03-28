'use strict'
const HapNodeJS = require("hap-nodejs");
const Service = HapNodeJS.Service;
const Accessory = HapNodeJS.Accessory;
const Characteristic = HapNodeJS.Characteristic;
const uuid = HapNodeJS.uuid;
const CharacteristicEventTypes = HapNodeJS.CharacteristicEventTypes;
const AccessoryEventTypes = HapNodeJS.AccessoryEventTypes;
const EventEmitter = require("events");
const PKG = require('../package.json');
const CameraSource = require('./cameraSource');


/** 
* Common Accessory Class
* A prototype class from which all accessories are based.
* It contains the event emitter, the creation of the accessory its self, and attaching some needed events.
*/ 
class AccessoryCLS extends EventEmitter
{
    constructor(AccessoryOBJ, Category, isBridge)
    {
        super();
        
        this._Properties = {};
        HapNodeJS.init(process.cwd() + "/homekit");

        const UUID = uuid.generate('hap-nodejs:accessories:'+ AccessoryOBJ.name+':'+AccessoryOBJ.username);
        this._accessory = new Accessory(AccessoryOBJ.name, UUID);
        this._accessory._isBridge = isBridge;
    
        this._accessory.username = AccessoryOBJ.username;
        this._accessory.pincode = AccessoryOBJ.pincode;
        this._accessory.category = Category;
        this._accessory.setupID = AccessoryOBJ.setupID;

        this._accessory.on(AccessoryEventTypes.IDENTIFY,  (paired, callback) =>
        {
            callback();
            this.emit("IDENTIFY", paired)
        });
    
        this._accessory.on(AccessoryEventTypes.LISTENING,  (port) =>
        {
            this.emit("LISTENING", port)
        });
    
        this._accessory.on(AccessoryEventTypes.PAIRED, () =>
        {
            this.emit("PAIR_CHANGE", true);
        });
    
        this._accessory.on(AccessoryEventTypes.UNPAIRED, () =>
        {
            this.emit("PAIR_CHANGE", false);
        });
    }
}

/** 
* Helper method to attach get and set routines
*/
AccessoryCLS.prototype._wireUpEvents = function(targetService,EventStruct)
{
    const GetHooks = EventStruct.Get;
    const SetHooks = EventStruct.Set;

    for(let i = 0;i<GetHooks.length;i++)
    {
        targetService.getCharacteristic(Characteristic[GetHooks[i]])
        .on(CharacteristicEventTypes.GET,(cb) => this._get(GetHooks[i],cb))
    }

    for(let i = 0;i<SetHooks.length;i++)
    {
        targetService.getCharacteristic(Characteristic[SetHooks[i]])
        .on(CharacteristicEventTypes.SET,(value, callback, hap) => this._set(SetHooks[i],value,callback,hap))
    }
}

/** 
* Internal set
*/
AccessoryCLS.prototype._set = function(property, value, callback, hap)
{
    const PL = {
        "characteristic": property,
        "value": value,
     }

     this.emit("STATE_CHANGE", PL,hap == null ? "API" : "iOS_DEVICE");
     this._Properties[property] = value;
     callback(null);
}
/** 
* Internal get
*/
AccessoryCLS.prototype._get = function(property,callback)
{
    if (this._Properties[property] != null)
    {
        callback(null, this._Properties[property]);
    }
    else
    {
        callback(null, null);
    }
}
/** 
* Get Accessory
*/
AccessoryCLS.prototype.getAccessory = function()
{
    return this._accessory;
}
/** 
* Publish
*/
AccessoryCLS.prototype.publish = function()
{

    this._accessory.publish({ username: this._accessory.username, pincode: this._accessory.pincode, category: this._accessory.category, setupID: this._accessory.setupID })
}
/** 
* unpublish
*/
AccessoryCLS.prototype.unpublish = function(destroy)
{
    if(destroy)
    {
        this._accessory.destroy();
    }
    else
    {
        this._accessory.unpublish()
    }
}
/** 
* get all properties
*/
AccessoryCLS.prototype.getProperties = function()
{
   return this._Properties;
    
}
/** 
* add accessory (for bridge)
*/
AccessoryCLS.prototype.addAccessory = function(Accessory)
{
    if(this._accessory._isBridge)
    {
        this._accessory.addBridgedAccessory(Accessory);
        
    }
}
/** 
* remove accessory (for bridge)
*/
AccessoryCLS.prototype.removeAccessory = function(Accessory)
{
    if(this._accessory._isBridge)
    {
        this._accessory.removeBridgedAccessory(Accessory,false)
        
    }
}
/** 
* get accessories  (for bridge)
*/
AccessoryCLS.prototype.getAccessories = function()
{
    if(this._accessory._isBridge)
    {
        return this._accessory.bridgedAccessories;
        
    }
}
/** 
* helper method to create a battery service
*/
AccessoryCLS.prototype._createBatteryService = function()
{
    this._batteryService = new Service.BatteryService('','');
    this._batteryService.setCharacteristic(Characteristic.BatteryLevel, 100);
    this._batteryService.setCharacteristic(Characteristic.StatusLowBattery, 0);
    this._batteryService.setCharacteristic(Characteristic.ChargingState, 0);
    this._Properties["BatteryLevel"] = 100;
    this._Properties["StatusLowBattery"] = 0;
    this._Properties["ChargingState"] = 0;

    const EventStruct = {
        "Get":["BatteryLevel","StatusLowBattery","ChargingState"],
        "Set":[]
    }

    this._wireUpEvents(this._batteryService,EventStruct)
    this._accessory.addService(this._batteryService);
}

/** 
* Main Bridge
*/
class Bridge extends AccessoryCLS
{
    constructor(Config)
    {
        Config.name = "HomeKit Device Stack"
        super(Config, Accessory.Categories.BRIDGE,true);

        this._accessory.getService(Service.AccessoryInformation)
        .setCharacteristic(Characteristic.Name, Config.name )
        .setCharacteristic(Characteristic.Manufacturer, PKG.author.name)
        .setCharacteristic(Characteristic.Model, "HKPLG1")
        .setCharacteristic(Characteristic.SerialNumber, Config.serialNumber)
        .setCharacteristic(Characteristic.FirmwareRevision,PKG.version);
    }
}

/** 
* Public Basic Set
*/
const _basicSet = function(payload)
{
    const Props = Object.keys(payload);

    for (let i = 0; i < Props.length; i++)
    {
        this._Properties[Props[i]] = payload[Props[i]];
        this._service.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
        
    }
}
/** 
* Public Set with a possible battey service
*/
const _setWithBattery = function (payload)
{
    const Props = Object.keys(payload);
    const BatteryTargets = ["BatteryLevel", "StatusLowBattery", "ChargingState"]

    for (let i = 0; i < Props.length; i++)
    {
        this._Properties[Props[i]] = payload[Props[i]];

        if (BatteryTargets.includes(Props[i]))
        {
            this._batteryService.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
            this._Properties[Props[i]] = payload[Props[i]];
        }
        else
        {
            this._service.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
            this._Properties[Props[i]] = payload[Props[i]];
        }

    }
}


/** 
* Outlet Accessory
*/
class Outlet extends AccessoryCLS
{
    
    constructor(Config)
    {
        super(Config, Accessory.Categories.OUTLET,false);

        this._service = new Service.Outlet(Config.name,Config.name);
        
        this._service.setCharacteristic(Characteristic.On, false);
        this._service.setCharacteristic(Characteristic.OutletInUse, false);
        this._Properties["On"] = false;
        this._Properties["OutletInUse"] = false;

        const EventStruct = {
            "Get":["On","OutletInUse"],
            "Set":["On"]
        }

        this._wireUpEvents(this._service,EventStruct);
        this._accessory.addService(this._service);
    }
}
Outlet.prototype.setCharacteristics = _basicSet;

/** 
* Switch Accessory
*/
class Switch extends AccessoryCLS
{
    constructor(Config)
    {
        super(Config, Accessory.Categories.SWITCH,false);

        this._service = new Service.Switch(Config.name,Config.name)

        this._service.setCharacteristic(Characteristic.On, false);
        this._Properties["On"] = false;

        const EventStruct = {
            "Get":["On"],
            "Set":["On"]
        }

        this._wireUpEvents(this._service,EventStruct);
        this._accessory.addService(this._service);
    

    }
}
Switch.prototype.setCharacteristics = _basicSet;

/** 
* Alarm Accessory
*/
class Alarm extends AccessoryCLS
{
    constructor(Config)
    {
        super(Config, Accessory.Categories.SECURITY_SYSTEM,false);

        this._service = new Service.SecuritySystem(Config.name,Config.name);

        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._service.setCharacteristic(Characteristic.SecuritySystemCurrentState, 3);
        this._service.setCharacteristic(Characteristic.SecuritySystemTargetState, 3);
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;
        this._Properties["SecuritySystemCurrentState"] = 3;
        this._Properties["SecuritySystemTargetState"] = 3;

        const EventStruct = {
            "Get":["SecuritySystemTargetState","StatusFault","StatusTampered","SecuritySystemCurrentState"],
            "Set":["SecuritySystemTargetState"]
        }

        this._wireUpEvents(this._service,EventStruct);
        this._accessory.addService(this._service);
    

    }
}
Alarm.prototype.setCharacteristics = _basicSet;

/** 
* TV Accessory Speaker Set support
*/
const _TVSet = function (payload)
{
    const Props = Object.keys(payload);

    for (let i = 0; i < Props.length; i++)
    {
        this._Properties[Props[i]] = payload[Props[i]];

        this._service.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
        if (Props[i] == "Active")
        {
            // speaker and tv are one
            this._Speaker.setCharacteristic(Characteristic[Props[i]], payload[Props[i]])
        }

    }
}
/** 
* TV Accessory
*/
class TV extends AccessoryCLS
{

    constructor(Config)
    {
        super(Config, Accessory.Categories.TELEVISION, false);

        this._Inputs = [];

        this._service = new Service.Television(Config.name,Config.Name);
        this._service.setCharacteristic(Characteristic.ConfiguredName, Config.name);
        this._service.setCharacteristic(Characteristic.SleepDiscoveryMode, Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);
        this._service.setCharacteristic(Characteristic.ActiveIdentifier, 1);
        this._service.setCharacteristic(Characteristic.Active, 0);
        this._Properties["Active"] = 0;
        this._Properties["ActiveIdentifier"] = 1;

        var EventStruct = {
            "Get":["Active","ActiveIdentifier"],
            "Set":["Active","RemoteKey","ActiveIdentifier","PowerModeSelection"]
        }

        this._wireUpEvents(this._service,EventStruct);
        this._accessory.addService(this._service);


        // Speaker
        this._Speaker = new Service.TelevisionSpeaker('','')
        this._Speaker.setCharacteristic(Characteristic.Active, 0)
        this._Speaker.setCharacteristic(Characteristic.VolumeControlType, Characteristic.VolumeControlType.ABSOLUTE);

        EventStruct = {
            "Get":["Active","VolumeSelector"],
            "Set":["VolumeSelector"]
        }

        this._wireUpEvents(this._Speaker,EventStruct);
        this._accessory.addService(this._Speaker);

        // Inputs
        for (let i = 0; i < Config.inputs.length; i++)
        {
            if(Config.inputs[i].length < 1)
            {
                continue;
            }
            const Input = new Service.InputSource(Config.inputs[i],Config.inputs[i])
            Input.setCharacteristic(Characteristic.Identifier, (i + 1))
            Input.setCharacteristic(Characteristic.ConfiguredName, Config.inputs[i])
            Input.setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
            Input.setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI)
            Input.setCharacteristic(Characteristic.CurrentVisibilityState, 0);
            Input.setCharacteristic(Characteristic.TargetVisibilityState, 0);
            this._accessory.addService(Input);
            this._service.addLinkedService(Input);

            this._Inputs.push(this.Input);
        }
    }
}
TV.prototype.setCharacteristics = _TVSet;

/** 
* CCTV Camera - these will not be bridged, and require a little more setup.
*/
class Camera extends AccessoryCLS
{
    constructor(Config)
    {
        super(Config, Accessory.Categories.CAMERA, false);

        this._CS = new CameraSource.Camera(Config)
        this._accessory.configureCameraSource(this._CS);
    }
}

/** 
* Contact Accessory
*/
class Contact extends AccessoryCLS
{
    
    constructor(Config)
    {
        super(Config, Accessory.Categories.SENSOR,false);
     

        this._service = new Service.ContactSensor(Config.name,Config.name);

        this._service.setCharacteristic(Characteristic.ContactSensorState, 0);
        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._service.setCharacteristic(Characteristic.StatusActive, 1);
        this._Properties["ContactSensorState"] = 0;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;
        this._Properties["StatusActive"] = 1;

        const EventStruct = {
            "Get":["ContactSensorState","StatusFault","StatusTampered","StatusActive"],
            "Set":[]
        }

        this._wireUpEvents(this._service,EventStruct);
        this._accessory.addService(this._service);

        this._createBatteryService();
    }
}
Contact.prototype.setCharacteristics = _setWithBattery;

/** 
* Motion Sensor Accessory
*/
class Motion extends AccessoryCLS
{
    
    constructor(Config)
    {
        super(Config, Accessory.Categories.SENSOR,false);
      

        this._service = new Service.MotionSensor(Config.name,Config.name);

        this._service.setCharacteristic(Characteristic.MotionDetected, false);
        this._service.setCharacteristic(Characteristic.StatusActive, 1);
        this._service.setCharacteristic(Characteristic.StatusFault, 0);
        this._service.setCharacteristic(Characteristic.StatusTampered, 0);
        this._Properties["MotionDetected"] = false;
        this._Properties["StatusActive"] = 1;
        this._Properties["StatusFault"] = 0;
        this._Properties["StatusTampered"] = 0;

       

        const EventStruct = {
            "Get":["MotionDetected","StatusActive","StatusTampered","StatusFault"],
            "Set":[]
        }

        this._wireUpEvents(this._service,EventStruct);
        this._accessory.addService(this._service);

        this._createBatteryService();
    }
}
Motion.prototype.setCharacteristics = _setWithBattery;

/** 
* Lock Accessory
*/
class Lock extends AccessoryCLS
{
    
    constructor(Config)
    {
        super(Config, Accessory.Categories.DOOR_LOCK,false);
      

        this._service = new Service.LockMechanism(Config.name,Config.name);

        this._service.setCharacteristic(Characteristic.LockTargetState, 0);
        this._service.setCharacteristic(Characteristic.LockCurrentState, 0);
        this._Properties["LockTargetState"] = 0;
        this._Properties["LockCurrentState"] = 0;

        const EventStruct = {
            "Get":["LockTargetState","LockCurrentState"],
            "Set":["LockTargetState"]
        }

        this._wireUpEvents(this._service,EventStruct);
        this._accessory.addService(this._service);
    }
}
Lock.prototype.setCharacteristics = _basicSet;

/** 
* Garage Door Accessory
*/
class GarageDoor extends AccessoryCLS
{
    
    constructor(Config)
    {
        super(Config, Accessory.Categories.GARAGE_DOOR_OPENER,false);
      

        this._service = new Service.GarageDoorOpener(Config.name,Config.name);

        this._service.setCharacteristic(Characteristic.CurrentDoorState, 0);
        this._service.setCharacteristic(Characteristic.TargetDoorState, 0);
        this._service.setCharacteristic(Characteristic.LockCurrentState, 0);
        this._service.setCharacteristic(Characteristic.LockTargetState, 0);
        this._service.setCharacteristic(Characteristic.ObstructionDetected, false);
        this._Properties["CurrentDoorState"] = 0;
        this._Properties["TargetDoorState"] = 0;
        this._Properties["LockCurrentState"] = 0;
        this._Properties["LockTargetState"] = 0;
        this._Properties["ObstructionDetected"] = false;

        const EventStruct = {
            "Get":["CurrentDoorState","TargetDoorState","LockCurrentState","LockTargetState","ObstructionDetected"],
            "Set":["TargetDoorState","LockTargetState"]
        }

        this._wireUpEvents(this._service,EventStruct);
        this._accessory.addService(this._service);
    }
}
GarageDoor.prototype.setCharacteristics = _basicSet;

/** 
* Thermotsat Accessory
*/
class Thermostat extends AccessoryCLS
{
    
    constructor(Config)
    {
        super(Config, Accessory.Categories.THERMOSTAT,false);
      

        this._service = new Service.Thermostat(Config.name,Config.name);

        this._service.setCharacteristic(Characteristic.CurrentHeatingCoolingState, 0);
        this._service.setCharacteristic(Characteristic.TargetHeatingCoolingState, 0);
        this._service.setCharacteristic(Characteristic.CurrentTemperature, 21);
        this._service.setCharacteristic(Characteristic.TargetTemperature, 21);
        this._service.setCharacteristic(Characteristic.TemperatureDisplayUnits, 0);
        this._service.setCharacteristic(Characteristic.CoolingThresholdTemperature, 26);
        this._service.setCharacteristic(Characteristic.HeatingThresholdTemperature, 18);

        this._Properties["CurrentHeatingCoolingState"] = 0;
        this._Properties["TargetHeatingCoolingState"] = 0;
        this._Properties["CurrentTemperature"] = 21;
        this._Properties["TargetTemperature"] = 21;
        this._Properties["TemperatureDisplayUnits"] = 0;
        this._Properties["CoolingThresholdTemperature"] = 26;
        this._Properties["HeatingThresholdTemperature"] = 18;


       

        const EventStruct = {
            "Get":["TargetHeatingCoolingState","CurrentHeatingCoolingState","TemperatureDisplayUnits","CurrentTemperature","TargetTemperature","CoolingThresholdTemperature","HeatingThresholdTemperature"],
            "Set":["TargetHeatingCoolingState","TemperatureDisplayUnits","TargetTemperature","CoolingThresholdTemperature","HeatingThresholdTemperature"]
        }

        this._wireUpEvents(this._service,EventStruct);
        this._accessory.addService(this._service);
    }
}
Thermostat.prototype.setCharacteristics = _basicSet;


/**
* ConfigTypeID:{Template:HTML TPL File,Object:Class Object}
*/ 
const Types = {
    
    "SWITCH":           {"Title":"Switch","Description":"A simple On/Off switch.","Template":"Basic","Object":Switch},
    "OUTLET":           {"Title":"Electrical Outlet","Description":"A Smart Electrical Socket.","Template":"Basic","Object":Outlet},
    "TV":               {"Title":"Smart TV","Description":"A Smart Television.","Template":"TV","Object":TV},
    "CAMERA":           {"Title":"CCTV Camera","Description":"A CCTV Camera","Template":"Camera","Object":Camera},
    "ALARM":            {"Title":"Intruder Alarm","Description":"A Smart enabled Intruder Alarm","Template":"Basic","Object":Alarm},
    "CONTACT_SENSOR":   {"Title":"Contact Sensor","Description":"A contact sensor for doors,windows and other fixings.","Template":"Basic","Object":Contact},
    "MOTION_SENSOR":    {"Title":"Motion Sensor","Description":"A Motion Sensor","Template":"Basic","Object":Motion},
    "LOCK":             {"Title":"Smart Lock","Description":"A Smart enabled Lock.","Template":"Basic","Object":Lock},
    "GARAGE_DOOR":      {"Title":"Garage Door Opener","Description":"A Smart enabled Garage Door Opener","Template":"Basic","Object":GarageDoor},
    "THERMOSTAT":       {"Title":"Smart Thermostat","Description":"A Smart enabled Thermostat","Template":"Basic","Object":Thermostat}
    
}



module.exports = {

    Types:Types,
    Bridge:Bridge

}

