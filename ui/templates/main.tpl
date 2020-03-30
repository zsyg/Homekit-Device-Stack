<div class="TopBanner">Homekit Accessories
    <div style="float: right;">
        <span style=" cursor: pointer;" onclick="Routes()">Manage Routes</span> |
        <span style=" cursor: pointer;" onclick="ShowAvailableAccessories()">Add Accessory</span>
    </div>
</div>

<script>
    var templateLookup = {{{TemplateLookup}}};

</script>

{{#Config.accessories}}
  <div class="Accessory" id="{{usernameCleaned}}" style>
    <table style="color: rgb(255,255,255);">
        <tbody>
            <tr>
                <td style="padding-right:5px" valign="top">
                    <img class="invert" src="static/Images/device_icons/{{type}}.png" />
                </td>
                <td valign="top" style="text-align:left;width:95%">
                    
                    <div style="font-weight:bold;font-size:24px">{{name}}</div>
                    
                    <div style="font-size:14px">{{description}}</div><br />
                    <div style="font-size:14px">Device ID : {{accessoryID}}, API Address : <a target="_blank"  href="/password/accessories/{{accessoryID}}">accessories/{{accessoryID}}</a></div>
                

                    
                   
                </td>
                <td valign="top"><div onclick="edit('{{type}}','{{username}}')" style="text-align: center;cursor: pointer;margin-bottom: 5px;">[Configure]</div><div onclick="delete_accessory('{{username}}')" style="text-align: center;cursor: pointer;margin-bottom: 5px;">[Delete]</div></td>
            </tr>

        </tbody>
    </table>



</div>
<script>GetProperties('{{accessoryID}}');</script>
{{/Config.accessories}}



<div id="AddAccessory" class="SideNav">
    <div style="margin-left: 30px; cursor: pointer;" onclick="Close()"> Close</div>
    <br />
    {{#AvailableTypes}}



    <div style="margin-left: 30px;margin-bottom: 5px; cursor: pointer;" onclick="add('{{Value.Title}}','{{Value.Template}}','{{Value.Description}}','{{Key}}')">
        <table style="color: rgb(255,255,255);">
            <tr>
                <td rowspan="2" style="width: 40px;">
                    <img style="width: 30px;vertical-align: middle;" class="invert"  src="Static/Images/device_icons/{{Key}}.png">
                </td>
            </tr>
            <tr>
                <td>
                    <div style="line-height: 15px;">{{Value.Title}}</div>
                    <span style="font-size:12px;">{{Value.Description}}</span>
                </td>
            </tr>
        </table>
        
        
    </div>
  
    {{/AvailableTypes}}


</div>