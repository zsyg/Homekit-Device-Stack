<div class="TopBanner">Homekit Accessories
<div style="float:right; cursor: pointer;" onclick="ShowAvailableAccessories()">Add Accessory</div>
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
                <td valign="top" style="text-align:left;width:100%">
                    
                    <div style="font-weight:bold;font-size:24px">{{name}}</div>
                    
                    <div style="font-size:14px">{{description}}</div><br />
                    <div style="font-size:14px">API Address : <a target="_blank"  href="/accessories/{{usernameCleaned}}">accessories/{{usernameCleaned}}</a></div>
                

                    
                   
                </td>
                <td valign="top"><div onclick="edit('{{type}}','{{username}}')">Configure</div></td>
            </tr>

        </tbody>
    </table>



</div>
<script>GetProperties('{{usernameCleaned}}');</script>
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