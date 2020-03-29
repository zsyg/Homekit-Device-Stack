'use strict'
const express = require('express')
const websocket = require('ws')
const crypto = require('crypto')
const mustache = require('mustache');
const fs = require('fs');
const config = require(process.cwd() + "/config.json");
const bodyParser = require('body-parser')
const Accessory = require('./accessory');
const util = require('./util');

const Server = function(Accesories, ChangeEvent, IdentifyEvent, Bridge,RouteSetup)
{
    const _Clients = [];
    let _Paired = false;
    const _Accessories = Accesories
    const _ChangeEvent = ChangeEvent;
    const _IdentifyEvent = IdentifyEvent
    const _Bridge = Bridge;
    const _RouteSetup = RouteSetup


    // Express
    const app = express()
    app.use(bodyParser.json())
    app.use('/static', express.static(process.cwd() + '/ui/static'))
    app.get('/:pwd/accessories/',_processAccessoriesGet);
    app.get('/:pwd/accessories/:id', _processAccessoryGet);
    app.post('/:pwd/accessories/:id', _processAccessorySet);
    app.get('/', _sendIndex);
    app.listen(config.webInterfacePort)

    // Send Index Page (Starts the WS connection in doing so)
    function _sendIndex(req, res)
    {
        const TPL = fs.readFileSync(Templates.Index, 'utf8');
        const HTML = mustache.render(TPL, { "Config": config });

        res.send(HTML)
    }
    // Comms Socket
    const WS = new websocket.Server({ port: config.wsCommPort });

    // Once a WS is connected - send them the Login page
    WS.on('connection', function (connection)
    {
        _Clients.push(connection);
        _sendLogin(connection);
        connection.on('message', (m) => _processClientMessage(m,connection));
    });

    // Template Files
    const Templates ={
        "Login":process.cwd()+"/ui/templates/login.tpl",
        "Index":process.cwd()+"/ui/templates/index.tpl",
        "Main":process.cwd()+"/ui/templates/main.tpl",
        "Setup":process.cwd()+"/ui/templates/setup.tpl",
        "Routes":process.cwd()+"/ui/templates/routes.tpl"
    }

   

    function _processClientMessage(message, connection)
    {
        const Req = JSON.parse(message)

        switch (Req.type)
        {
            case "login":
                _login(Req, connection);
                break;

            case "add":
                _showAdd(Req, connection)
                break;

            case "edit":
                _showEdit(Req, connection)
                break;

            case "main":
                _sendDash(connection)
                break;

            case "createAccessory":
                _createAccessory(Req.config, connection)
                break;

            case "editAccessory":
                _editAccessory(Req.config,Req.username, connection)
                break;

            case "routes":
                _showRoutes(connection);
                break;

            case "saveRoutes":
                _saveRoutes(Req.routeConfig,connection);
                break;

        }
    }

    function _showRoutes(connection)
    {
        const TPL = fs.readFileSync(Templates.Routes, 'utf8');
        const HTML = mustache.render(TPL, {"Routes":JSON.stringify(config.routes,null,2)});

        const PL = {
            "type": "page",
            "content":HTML
        }

        connection.send(JSON.stringify(PL));
    }

    function _saveRoutes(Config,connection)
    {
       config.routes = Config;
       util.updateRouteConfig(Config);
       _RouteSetup();
       _sendDash(connection);

    }

    function _sendLogin(connection)
    {
        const TPL = fs.readFileSync(Templates.Login, 'utf8');
        const HTML = mustache.render(TPL, {"Config":config});

        const PL = {
            "type": "page",
            "content":HTML
        }

        connection.send(JSON.stringify(PL));
    }

    function _sendSetup(connection)
    {
        const TPL = fs.readFileSync(Templates.Setup, 'utf8');
        const HTML = mustache.render(TPL, { "Config": config});

        const PL = {
            "type": "page",
            "content": HTML
        }
        connection.send(JSON.stringify(PL));
    }

    function _sendDash(connection)
    {
        
        const TypeArray = [];
        const Keys = Object.keys(Accessory.Types);
        for(let i = 0;i<Keys.length;i++)
        {
            TypeArray.push({"Key":Keys[i],"Value":Accessory.Types[Keys[i]]})
        }

       

        const TPL = fs.readFileSync(Templates.Main, 'utf8');
        const HTML = mustache.render(TPL, { "Config": config,"AvailableTypes":TypeArray,"TemplateLookup":JSON.stringify(Accessory.Types)});

        const PL = {
            "type": "page",
            "content": HTML
        }
        connection.send(JSON.stringify(PL));
    }


    function _createAccessory(AccessoryOBJ,connection)
    {
        AccessoryOBJ["pincode"] = util.getRndInteger(100, 999) + "-" + util.getRndInteger(10, 99) + "-" + util.getRndInteger(100, 999);
        AccessoryOBJ["username"] = util.genMAC();
        AccessoryOBJ["setupID"] = util.makeID(4);
        AccessoryOBJ["serialNumber"] = util.makeID(12);


        util.appendAccessoryToConfig(AccessoryOBJ)

        AccessoryOBJ.accessoryID = AccessoryOBJ.username.replace(/:/g, "");

        config.accessories.push(AccessoryOBJ)

        switch(AccessoryOBJ.type)
        {

            default:
                let Acc = new  Accessory.Types[AccessoryOBJ.type].Object(AccessoryOBJ);
                Acc.on('STATE_CHANGE', (PL,O) =>_ChangeEvent(PL, AccessoryOBJ,O))
                Acc.on('IDENTIFY', (P) => _IdentifyEvent(P, AccessoryOBJ))
                _Accessories[AccessoryOBJ.accessoryID] = Acc;
                _Bridge.addAccessory(Acc.getAccessory())
                break;
        }

        
       _sendDash(connection);
    }

    function _editAccessory(AccessoryOBJ,username,connection)
    {
 


        util.editAccessory(AccessoryOBJ,username)

        const TargetAc = config.accessories.filter(a => a.username == username)[0]
   

        const Keys = Object.keys(AccessoryOBJ);
    
        for(let i = 0;i<Keys.length;i++)
        {
            if(TargetAc.hasOwnProperty(Keys[i]))
            {
                TargetAc[Keys[i]] = AccessoryOBJ[Keys[i]];
            }
        }

      
        //removeAccessory
        const Acs = _Bridge.getAccessories();
        const TargetBAcs = Acs.filter(a=> a.username == username)[0];
        _Bridge.removeAccessory(TargetBAcs);

        // re-add
        const Acc = new  Accessory.Types[TargetAc.type].Object(TargetAc);
        Acc.on('STATE_CHANGE', (PL,O) =>_ChangeEvent(PL, TargetAc,O))
        Acc.on('IDENTIFY', (P) => _IdentifyEvent(P, TargetAc))
        _Accessories[TargetAc.accessoryID] = Acc;
        _Bridge.addAccessory(Acc.getAccessory())



     

        

        
       _sendDash(connection);
    }

    function _login(Req,connection)
    {
        const UN = Req.username;
        const PW = crypto.createHash('md5').update(Req.password).digest("hex");

        if (UN == config.loginUsername && PW == config.loginPassword)
        {
            var TPL;
            if (_Paired)
            {
                _sendDash(connection);
            }
            else
            {
                _sendSetup(connection);
            }
        }
        else
        {
            const PL = {
                "type": "message",
                "content": "Sorry, those detail were incorrect. "
            }

            connection.send(JSON.stringify(PL));
        }
    }

    function _processAccessoriesGet(req,res)
    {
        const PW = crypto.createHash('md5').update(req.params.pwd).digest("hex");
        if(PW != config.loginPassword)
        {
            res.sendStatus(401);
            return;
        }

        const TPL = [];
        const Names = Object.keys(_Accessories);
        for(let i = 0;i<Names.length;i++)
        {
            const PL = {
                "id": Names[i],
                "name": _Accessories[Names[i]].getAccessory().displayName,
                "characteristics": _Accessories[Names[i]].getProperties()
            }
            TPL.push(PL)
        }

        res.contentType("application/json");
        res.send(JSON.stringify(TPL));
    }

    function _processAccessoryGet(req,res)
    {
        const PW = crypto.createHash('md5').update(req.params.pwd).digest("hex");
        if(PW != config.loginPassword)
        {
            res.sendStatus(401);
            return;
        }

        const Ac = _Accessories[req.params.id]

        const PL = {
            "id": req.params.id,
            "name": Ac.getAccessory().displayName,
            "characteristics": Ac.getProperties()
        }
        res.contentType("application/json");
        res.send(JSON.stringify(PL));
    }

    function _processAccessorySet(req, res)
    {
        const PW = crypto.createHash('md5').update(req.params.pwd).digest("hex");
        if(PW != config.loginPassword)
        {
            res.sendStatus(401);
            return;
        }

        const Ac = _Accessories[req.params.id]
        Ac.setCharacteristics(req.body)

        res.contentType("application/json");
        res.send(JSON.stringify({ok:true}));
    }

   
  

    function _showEdit(Req,connection)
    {
        const Template = Req.template;
        const RouteNames = Object.keys(config.routes)

        const A = config.accessories.filter(a => a.username == Req.username);
        

        const Payload = {

            "Title":Req.title,
            "Description":Req.description,
            "Type":Req.actype,
            "Routes":RouteNames,
            "CurrentConfig":JSON.stringify(A[0])
        }
        
        const TPL = fs.readFileSync( process.cwd()+"/ui/templates/device_config/"+Template+".tpl", 'utf8');
        const HTML = mustache.render(TPL, Payload);

        const PL = {
            "type": "page",
            "content": HTML
        }
        connection.send(JSON.stringify(PL));
    }

  
    function _showAdd(Req,connection)
    {
        const Template = Req.template;
        const RouteNames = Object.keys(config.routes)

        const Payload = {

            "Title":Req.title,
            "Description":Req.description,
            "Type":Req.actype,
            "Routes":RouteNames,
            "CurrentConfig":JSON.stringify({})
        }
        
        const TPL = fs.readFileSync( process.cwd()+"/ui/templates/device_config/"+Template+".tpl", 'utf8');
        const HTML = mustache.render(TPL, Payload);

        const PL = {
            "type": "page",
            "content": HTML
        }
        connection.send(JSON.stringify(PL));
    }

   

    this.setBridgePaired = function (IsPaired)
    {
        _Paired = IsPaired;

        
        if (_Paired)
        {
            for(let i = 0;i<_Clients.length;i++)
            {
                _sendDash( _Clients[i]);
             
            }
        }
        else
        {
            for(let i = 0;i<_Clients.length;i++)
            {
                _sendSetup( _Clients[i]);
             
            }
        }

      
    }

    this.push = function(payload)
    {
   
        for (let i = 0; i < _Clients.length; i++) {
            _Clients[i].send(JSON.stringify(payload))
        }
    }


}

module.exports = {
    Server: Server
}
