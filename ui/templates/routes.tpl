<div class="TopBanner">Manage Routes</div>
<div class="Middle Dialog" style="width:600px;margin-top:80px">
    <div class="Title">Manage Accessory Routes.</div>

    <div style="padding: 10px;">
        <p>Currently, routes are configured manually. The default configuration has all 4 Types configured. edit/add/delete as necessary.</p>
        <textarea id="RoutesConfig" class="Middle" style="width:100%;height:400px">{{Routes}}</textarea>
    
        <div style="text-align: right;">
        <input class="StyledButton" onclick="Main()" type="button" value="Cancel">
        <input class="StyledButton" onclick="SaveRoutes()" type="button" value="Save">
        </div>
        
    </div>
   
</div>