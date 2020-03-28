<script>
    var Config = {{{CurrentConfig}}};
</script>
<div class="TopBanner">Create A New Accessory</div>
<div class="Middle Dialog" style="width:600px;margin-top:80px;">
    <div class="Title">Create a new {{Title}} Accessory.</div>

    <table class="Middle" style="width:450px;margin-top:30px;">
        <tbody>
            <tr>
                <td style="text-align:left;"><img src="Static/Images/device_icons/{{Type}}.png"></td>
                <td style="text-align:right;">
                    {{Description}}
            </td>

            </tr>
            <tr>
                <td colspan="2" style="text-align:left;padding-bottom:20px">Once created, the accessory should appear in
                    HomeApp within a few moments. Closing HomeApp and opening it again maybe required in some cases.
                </td>


            </tr>
            <tr>
                <td style="text-align:left;">Name Of Accessory</td>
                <td style="text-align:right;">
                    <input config="name" class="config" type="text">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Description</td>
                <td style="text-align:right;">
                    <input config="description" class="config" type="text">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Route</td>
                <td style="text-align:right;">
                    <select config="route" class="config">
                    {{#Routes}}
                        <option value="{{.}}">{{.}}</option>
                    {{/Routes}}
                    </select>
                </td>
            </tr>

            <tr>
                <td colspan="2" style="text-align:right;padding-bottom:20px">
                <input class="StyledButton" onclick="Main()" type="button" value="Cancel">
                    <input class="StyledButton" onclick="Save('{{Type}}')" type="button" value="Create">
                </td>
            </tr>
        </tbody>
    </table>
</div>

<script>
 Prefill();
</script>