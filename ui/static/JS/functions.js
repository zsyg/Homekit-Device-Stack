let Socket;

function StartClient(port)
{
    Socket = new WebSocket('ws://' + window.location.hostname + ':' + port);
    Socket.onopen = ClientConnectionDone;
}

function ClientConnectionDone()
{
    Socket.onmessage = ProcessMessage;
}

function ProcessMessage(Message)
{
    const MSG = JSON.parse(Message.data)
    switch (MSG.type)
    {
        case "page":
            $('#Content').html(MSG.content);
            break;

        case "message":
            $('#Message').text(MSG.content);
            break;


    }
}

function GetProperties(id)
{
    const URI = '/accessories/' + id;

    $.getJSON(URI, function (PL)
    {
        const Characteristics = Object.keys(PL.characteristics);
        for (let i = 0; i < Characteristics.length; i++)
        {

        }

    });


}

function ShowAvailableAccessories()
{
    document.getElementById("AddAccessory").style.width = "380px";
}

function Close()
{
    document.getElementById("AddAccessory").style.width = "0px";
}

function expandAccessory(element)
{
    let Parent = $(element).closest('div.Accessory');
    $(Parent).animate({ height: "300px" });
}

function Main()
{
    let Req =
    {
        "type": "main",
    }
    Socket.send(JSON.stringify(Req));
}

function add(title, template, description, type)
{
    let Req =
    {
        "title": title,
        "type": "add",
        "template": template,
        "description": description,
        "actype": type


    }

    Socket.send(JSON.stringify(Req));
}

function edit(type,username)
{
    const Template = templateLookup[type];
    let Req =
    {
        "title": Template.Title,
        "type": "edit",
        "template": Template.Template,
        "description": Template.Description,
        "actype": type,
        "username":username


    }
    Socket.send(JSON.stringify(Req));
   
}

function Prefill()
{
    if(Config.hasOwnProperty('username'))
    {
        $(".config").each(function()
        {
            const OBJ = $(this);
            OBJ.val(Config[OBJ.attr('config')]);
        })
    }
    
  
}

function Save(ObjectType)
{
    if(Config.hasOwnProperty('username'))
    {
        const AccessoryDetail = {}
        AccessoryDetail["type"] = ObjectType;
    
        $(".config").each(function()
        {
            const OBJ = $(this);
            AccessoryDetail[OBJ.attr('config')] = OBJ.val();
        })
    
        let Req =
        {
            "type": "editAccessory",
            "config":AccessoryDetail,
            "username":Config.username
        }
    
        Socket.send(JSON.stringify(Req));
    }
    else
    {
        const AccessoryDetail = {}
        AccessoryDetail["type"] = ObjectType;
    
        $(".config").each(function()
        {
            const OBJ = $(this);
            AccessoryDetail[OBJ.attr('config')] = OBJ.val();
        })
    
        let Req =
        {
            "type": "createAccessory",
            "config":AccessoryDetail
        }
    
        Socket.send(JSON.stringify(Req));
    }
   

}

function Login()
{
    let Req =
    {
        "type": "login",
        "username": $('#username').val(),
        "password": $('#password').val()
    }

    Socket.send(JSON.stringify(Req));
}