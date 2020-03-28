'use strict'
const http = require('http')
const url = require('url');
const fs = require('fs');
const path = require('path');
const dgram = require("dgram");
const mqtt = require('mqtt')

const HTTP = function (route, payload)
{

  const Copy = JSON.parse(JSON.stringify(payload));

  delete Copy.accessory.pincode;
  delete Copy.accessory.username;
  delete Copy.accessory.setupID;
  delete Copy.accessory.route;
  delete Copy.accessory.name;
  delete Copy.accessory.description;

  const Data = JSON.stringify(Copy)
  const URI = url.parse(route.destinationURI)

  const options = {
    hostname: URI.hostname,
    port: URI.port,
    path: URI.pathname,
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Data.length
    }
  }

  const req = http.request(options, (res) => { });
  req.on('error', (err) => { })
  req.write(Data);
  req.end()
}

const UDP = function(route, payload)
{
  const Copy = JSON.parse(JSON.stringify(payload));

  delete Copy.accessory.pincode;
  delete Copy.accessory.username;
  delete Copy.accessory.setupID;
  delete Copy.accessory.route;
  delete Copy.accessory.name;
  delete Copy.accessory.description;

  const server = dgram.createSocket("udp4");

  server.bind(function(){
    
    server.setBroadcast(true);
    const STRING = JSON.stringify(Copy)
    server.send(STRING,0,STRING.length,route.port,route.address,function(e,n)
    {
      server.close();
    });
  });

 
  
}

const MQTT = function(route, payload)
{
  const Copy = JSON.parse(JSON.stringify(payload));

  delete Copy.accessory.pincode;
  delete Copy.accessory.username;
  delete Copy.accessory.setupID;
  delete Copy.accessory.route;
  delete Copy.accessory.name;
  delete Copy.accessory.description;

   const MQTTC = mqtt.connect(route.broker)

   MQTTC.on('connect',function()
   {
      MQTTC.publish(route.topic, JSON.stringify(Copy),null,function()
      {
        MQTTC.end();
      })
   })
}

const FILE = function (route, payload)
{

  let Copy = JSON.parse(JSON.stringify(payload));

  delete Copy.accessory.pincode;
  delete Copy.accessory.username;
  delete Copy.accessory.setupID;
  delete Copy.accessory.route;
  delete Copy.accessory.name;
  delete Copy.accessory.description;



  const DT = new Date().getTime();
  const Path = path.join(route.directory, DT + '_' + payload.accessory.accessoryID + ".json")
  fs.writeFile(Path, JSON.stringify(Copy), 'utf8', function (err)
  {
    if (err) {
      console.log('Could not create config file')
    }

  })
}



module.exports = {

    "HTTP": HTTP,
    "UDP" : UDP,
    "FILE":FILE,
    "MQTT":MQTT

}