'use strict'
const http = require('http')
const url = require('url');
const fs = require('fs');
var path = require('path');

const HTTP = function (route, payload)
{

  const Copy = JSON.parse(JSON.stringify(payload));

  delete Copy.accessory.pincode;
  delete Copy.accessory.username;
  delete Copy.accessory.setupID;
  delete Copy.accessory.route;

  const Data = JSON.stringify(Copy)
  const URI = url.parse(route.destinationURI)

  const options = {
    hostname: URI.hostname,
    port: URI.port,
    path: URI.pathname,
    method: route.method,
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
    
}

const TCP = function(route, payload)
{
    
}

const MQTT = function(route, payload)
{
    
}

const FILE = function (route, payload)
{

  let Copy = JSON.parse(JSON.stringify(payload));

  delete Copy.accessory.pincode;
  delete Copy.accessory.username;
  delete Copy.accessory.setupID;
  delete Copy.accessory.route;



  const DT = new Date().getTime();
  const Path = path.join(route.directory, DT + '_' + payload.accessory.usernameCleaned + ".json")
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
    "TCP":TCP,
    "MQTT":MQTT

}