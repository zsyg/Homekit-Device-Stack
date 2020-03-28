# Homekit Device Stack
A Middleware Server, for bringing HomeKit functionality to your Home Automation.

 ## Say What!?
HomeKit Device Stack is a NodeJS server with a fully graphical web frontend, if you're a Home Automation Enthusiast, wanting to explore and learn HomeKit, HomeKit Device Stack can do that. If you're a serious Home Automation User, then HomeKit Device Stack plays nice with other automation systems by using common transport mechanisms.

## OK, but what does it actually do?
In essance, you create devices via the web frontend, be it a Smart TV, Intruder Alarm, A Door Sensor, a thermostat, a Party Switch and many many more.
You then have fun with it on your iDevice.

If however, you actually want to gain some usefulness from it, keep reading.

## The Keep Reading Part.
After you have created a device, you then program it, to advertise its changes. This can be done in a number of ways. (Unless you just want to show your geeky mates that you have HomeKit devices) 

  - HTTP
  - UDP Broadcast
  - TCP
  - File
  - Email 
  
## This Sounds Familiar
This is not HomeBridge, HomeBridge is designed to bridge the gap between HomeKit and non compatbile devices. HomeKit Device Stack is quite different.
HomeKit Device Stack has been designed to act as sink. that is - you wire up the events from your devices into other automations, such as NodeRed, Home Assistant or any other system that can make use of one of the output mechanisms above.

The devcies Homekit Device Stack can create are as follows (more will become available as development progresses)

  - Switch
  - Outlet
  - Television
  - CCTV Camera
  - Intruder Alarm
  - Contact Sensor
  - Motion Sensor
  - Lock Mechanism
  - Garage Door Opener


## So, it only reports changes?
Nope!

HomeKit Device Stack has an a web API, that is used to alter the devices state, this alterred state is then reflected in HomeApp, or any other Homekit enabled application.

## Does It Run On My Microwave?
Not yet!
It will run on any platform that runs NodeJS (Windows, Linux, OSX, Raspberry Pi).

