
![Nodes](https://github.com/marcus-j-davies/Homekit-Device-Stack/blob/master/HKDS.png?raw=true)
# Homekit Device Stack
A Middleware Server, for bringing HomeKit functionality to your Home Automation.

 ## Say What!?
HomeKit Device Stack is a NodeJS server with a fully graphical web frontend, if you're a Home Automation Enthusiast, wanting to explore and learn HomeKit, HomeKit Device Stack can do that. If you're a serious Home Automation User, then HomeKit Device Stack plays nice with other automation systems by using common transport mechanisms.

## OK, but what does it actually do?
In essance, you create devices via the web frontend, be it a Smart TV, Intruder Alarm, A Door Sensor, a Thermostat, a Party Switch and many many more.
You then have fun with it on your iDevice.

![Nodes](https://github.com/marcus-j-davies/Homekit-Device-Stack/blob/master/Screenshot.png?raw=true)

If however, you actually want to gain some usefulness from it, keep reading.

## The Keep Reading Part.
After you have created a device, you then program it, to advertise its changes. This can be done in a number of ways. (Unless you just want to show your geeky mates that you have HomeKit devices) 

  - HTTP
  - UDP Broadcast
  - File
  - MQTT 

In HomeKit Device Stack, The above outputs are refered to as a 'route' you can create any number of routes, and any number of accessories can use a single route.
as an example: if you wanted  an accessory to forward its state changes to Node-Red, then you can create a UDP route, then have Node-Red listen on the UDP port for the Broadcast.
if you have an MQTT broker then you can achieve the same thing as with HTTP using the Node-Red HTTP IN node.

The payload that is sent via your configured route is below  
```
{
  "accessory": {
    "type": "SWITCH",
    "accessoryID": "FF6BF61E98E4"
  },
  "type": "change",
  "change": {
    "characteristic": "On",
    "value": true
  },
  "source": "iOS_DEVICE",
  "route_type": "MQTT"
}
```

The **source** object in the payload above, identfies where the change occurred **iOS_DEVICE** or **API**

## This Sounds Familiar
This is not HomeBridge, HomeBridge is designed to bridge the gap between HomeKit and non compatible devices. HomeKit Device Stack is quite different.
HomeKit Device Stack has been designed to act as a sink. that is - you wire up the events from your devices into other automations, such as NodeRed, Home Assistant or any other system that can make use of the output mechanisms above.

The devices Homekit Device Stack can create are as follows (more will become available as development progresses)

  - Switch
  - Outlet
  - Television
  - CCTV Camera
  - Intruder Alarm
  - Contact Sensor
  - Motion Sensor
  - Lock Mechanism
  - Garage Door Opener
  - Thermostat


## So, it only reports changes?
Nope!

HomeKit Device Stack has a REST based API, that is used to alter the devices state, this alterred state is then reflected in HomeApp, or any other Homekit enabled application.
changes originating from a call to the API will cause routes to trigger - making use of the **source** object can be used to filter these out.

The URL for the API is **http://IP-ADDRESS:7989/admin-password/**

  - GET **/accessories**             | Lists all accessories and there current characteristics
  - GET **/accessories/accessoryID** | Same as above but for the identified accessory
  - PUT **/accessories/accessoryID** | Sets characteristics for the identified accessory

The body in your HTTP PUT command, should be nothing more than a JSON object representing the characteristics to set

```
{
  "On": false,
  "OutletInUse": true
}
```

## Does It Run On My Microwave?
Not yet!
It will run on any platform that runs NodeJS (Windows, Linux, OSX, Raspberry Pi).

## Installing   
Ensure you have **NodeJS** and **NPM** installed.
Then install Homekit Device Stack

    npm -i homekit-device-stack

## Running
Within the directory that HomeKit Device Stack is installed.

    node app.js

If creating an auto start script - ensure the script is set to run under the installed directory

## Command line arguments
**reset** - Completely Resets HomeKit Device Stack, bringing it back to its default/unconfigured state (inlcuding the default password)  
**passwd** mypassword - set the admin password

## Credits
HomeKit Device Stack is based on the awesome [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS)
library, without it, projects like this one are not possible.

## Version History
  - 1.0.0  
    Initial Release

## To Do
  - Create a better UI for managing Routes
  - Continue to add more accessory types


