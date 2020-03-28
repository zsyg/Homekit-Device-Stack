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
                    HomeApp within a few moments. Closing HomeApp and opening it again maybe required in some cases.</td>


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
                <td style="text-align:left;">Video Processor</td>
                <td style="text-align:right;">
                    <input config="processor" class="config" type="text" value="ffmpeg">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Live Stream Source</td>
                <td style="text-align:right;">
                    <input config="liveStreamSource" class="config" type="text"
                        value="-rtsp_transport tcp -i rtsp://username:password@ip:port/StreamURI">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Still Image Source</td>
                <td style="text-align:right;">
                    <input config="stillImageSource" class="config" type="text"
                        value="-rtsp_transport tcp -i rtsp://username:password@ip:port/SnapshotURI">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Max Width &amp; Height</td>
                <td style="text-align:right;">
                    <input config="maxWidthHeight" class="config" type="text" value="1280x720">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Max Framerate</td>
                <td style="text-align:right;">
                    <input config="maxFPS" class="config" type="text" value="10">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Max Streams</td>
                <td style="text-align:right;">
                    <input config="maxStreams" class="config" type="text" value="2">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Video Encoder</td>
                <td style="text-align:right;">
                    <input config="encoder" class="config" type="text" value="libx264">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Max Bitrate</td>
                <td style="text-align:right;">
                    <input config="maxBitrate" class="config" type="text" value="300">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Packet Size</td>
                <td style="text-align:right;">
                    <input config="packetSize" class="config" type="text" value="1316">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Video Map</td>
                <td style="text-align:right;">
                    <input config="mapVideo" class="config" type="text" value="0:0">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Additional Processor Args</td>
                <td style="text-align:right;">
                    <input config="additionalCommandline" class="config" type="text"
                        value="-tune zerolatency -preset ultrafast">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Adhere To Requested Size</td>
                <td style="text-align:right;">
                    <select config="adhereToRequestedSize" class="config">
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Enable Audio</td>
                <td style="text-align:right;">
                    <select config="enableAudio" class="config">
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Audio Encoder</td>
                <td style="text-align:right;">
                    <input config="encoder_audio" class="config" type="text" value="libfdk_aac">
                </td>
            </tr>
            <tr>
                <td style="text-align:left;">Audio Map</td>
                <td style="text-align:right;">
                    <input config="mapAudio" class="config" type="text" value="0:1">
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