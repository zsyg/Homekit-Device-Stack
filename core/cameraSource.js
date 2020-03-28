'use strict'
const HapNodeJS = require('hap-nodejs')
const uuid = HapNodeJS.uuid
const Service = HapNodeJS.Service
const StreamController = HapNodeJS.StreamController
const crypto = require('crypto')
const ip = require('ip')
const spawn = require('child_process').spawn


const Camera = function(Config)
{
    const self = this;
    this.config = Config;

    this.services = []
    this.streamControllers = []
    this.pendingSessions = {}
    this.ongoingSessions = {}

    this.maxFPS = Config.maxFPS > 30 ? 30 : Config.maxFPS
    this.maxWidth = Config.maxWidthHeight.split("x")[0];
    this.maxHeight = Config.maxWidthHeight.split("x")[1];
    this.maxBitrate = Config.maxBitrate;


    const videoResolutions = []
    
    if (this.maxWidth >= 320) {
        if (this.maxHeight >= 240) {
            videoResolutions.push([320, 240, this.maxFPS])
            if (this.maxFPS > 15) {
                videoResolutions.push([320, 240, 15])
            }
        }
        if (this.maxHeight >= 180) {
            videoResolutions.push([320, 180, this.maxFPS])
            if (this.maxFPS > 15) {
                videoResolutions.push([320, 180, 15])
            }
        }
    }
    if (this.maxWidth >= 480) {
        if (this.maxHeight >= 360) {
            videoResolutions.push([480, 360, this.maxFPS])
        }
        if (this.maxHeight >= 270) {
            videoResolutions.push([480, 270, this.maxFPS])
        }
    }
    if (this.maxWidth >= 640) {
        if (this.maxHeight >= 480) {
            videoResolutions.push([640, 480, this.maxFPS])
        }
        if (this.maxHeight >= 360) {
            videoResolutions.push([640, 360, this.maxFPS])
        }
    }
    if (this.maxWidth >= 1280) {
        if (this.maxHeight >= 960) {
            videoResolutions.push([1280, 960, this.maxFPS])
        }
        if (this.maxHeight >= 720) {
            videoResolutions.push([1280, 720, this.maxFPS])
        }
    }
    if (this.maxWidth >= 1920) {
        if (this.maxHeight >= 1080) {
            videoResolutions.push([1920, 1080, this.maxFPS])
        }
    }

    const options = {
        proxy: false,
        srtp: true,
        video: {
            resolutions: videoResolutions,
            codec: {
                profiles: [0, 1, 2],
                levels: [0, 1, 2]
            },
        },
        audio: {
            codecs: [
                {
                    type: 'OPUS',
                    samplerate: 24
                },
                {
                    type: 'AAC-eld',
                    samplerate: 16
                },
            ],
        },
    }

    const controlService = new Service.CameraControl('', '');
    this.services.push(controlService);

   
    for (let i = 0; i < Config.maxStreams; i++)
    {
         const streamController = new StreamController(i, options, this)
         this.services.push(streamController.service)
         this.streamControllers.push(streamController)
    }
}

Camera.prototype.handleCloseConnection = function (connectionID)
{
    this.streamControllers.forEach(function (controller)
    {
        controller.handleCloseConnection(connectionID)
    })
}
Camera.prototype.handleSnapshotRequest = function(request, callback)
{
   
    const resolution = request.width + 'x' + request.height
    const ffmpeg = spawn("ffmpeg", (this.config.stillImageSource + ' -t 1 -s ' + resolution + ' -f image2 -').split(' '), { env: process.env })
    let imageBuffer = Buffer.alloc(0);

    ffmpeg.stdout.on('data', function(data)
    {
        imageBuffer = Buffer.concat([imageBuffer, data])
    })
    
    ffmpeg.on('close', function(code)
    {
        callback(null, imageBuffer)
    })
    
}
Camera.prototype.prepareStream = function (request, callback) {

   
    const sessionInfo = {}
    const sessionID = request['sessionID']
    sessionInfo['address'] = request['targetAddress']
    
    const response = {}
    
    const videoInfo = request['video']
    if (videoInfo)
    {
        const targetPort = videoInfo['port']
        const srtp_key = videoInfo['srtp_key']
        const srtp_salt = videoInfo['srtp_salt']
        
        // SSRC is a 32 bit integer that is unique per stream
        const ssrcSource = crypto.randomBytes(4)
        ssrcSource[0] = 0
        const ssrc = ssrcSource.readInt32BE(0, true)
        response['video'] = {port: targetPort,ssrc: ssrc, srtp_key: srtp_key,srtp_salt: srtp_salt}

        sessionInfo['video_port'] = targetPort
        sessionInfo['video_srtp'] = Buffer.concat([srtp_key, srtp_salt])
        sessionInfo['video_ssrc'] = ssrc
    }

    const audioInfo = request['audio']
    if (audioInfo)
    {
        const targetPort = audioInfo['port']
        const srtp_key = audioInfo['srtp_key']
        const srtp_salt = audioInfo['srtp_salt']

        // SSRC is a 32 bit integer that is unique per stream
        const ssrcSource = crypto.randomBytes(4)
        ssrcSource[0] = 0
        const ssrc = ssrcSource.readInt32BE(0, true)
        response['audio'] = { port: targetPort, ssrc: ssrc, srtp_key: srtp_key,srtp_salt: srtp_salt }

        sessionInfo['audio_port'] = targetPort
        sessionInfo['audio_srtp'] = Buffer.concat([srtp_key, srtp_salt])
        sessionInfo['audio_ssrc'] = ssrc
    }

    const currentAddress = ip.address()
    const addressResp = {
        address: currentAddress,
    }

    if (ip.isV4Format(currentAddress))
    {
        addressResp['type'] = 'v4'
    }
    else
    {
        addressResp['type'] = 'v6'
    }

    response['address'] = addressResp
    this.pendingSessions[uuid.unparse(sessionID)] = sessionInfo

    callback(response)
}
Camera.prototype.handleStreamRequest = function(request)
{
    const sessionID = request['sessionID']
    const requestType = request['type']

    if (sessionID)
    {
        const sessionIdentifier = uuid.unparse(sessionID)

        switch (requestType)
        {
            case "stop":

                const ffmpegProcess = this.ongoingSessions[sessionIdentifier]
                if (ffmpegProcess)
                {
                    ffmpegProcess.kill('SIGTERM')
                }
                delete this.ongoingSessions[sessionIdentifier]
                break;

            case "start":

                const sessionInfo = this.pendingSessions[sessionIdentifier]
                if (sessionInfo)
                {
                    let width = this.maxWidth;
                    let height = this.maxHeight;
                    let FPS = this.maxFPS;
                    let bitRate = this.maxBitrate
                    let aBitRate = 32
                    let aSampleRate = 16

                  //encoder_audio
                 

                    const videoInfo = request['video']
                    if (videoInfo)
                    {
                        width = videoInfo['width']
                        height = videoInfo['height']

                        const expectedFPS = videoInfo['fps']
                        if (expectedFPS < FPS)
                        {
                            FPS = expectedFPS
                        }
                        if (videoInfo['max_bit_rate'] < bitRate)
                        {
                            bitRate = videoInfo['max_bit_rate']
                        }
                    }
                    const audioInfo = request['audio']
                    if(audioInfo)
                    {
                        aBitRate = audioInfo['max_bit_rate']
                        aSampleRate = audioInfo['sample_rate']
                    }
                    
                    const targetAddress = sessionInfo['address']
                    const targetVideoPort = sessionInfo['video_port']
                    const videoKey = sessionInfo['video_srtp']
                    const videoSsrc = sessionInfo['video_ssrc']
                    const targetAudioPort = sessionInfo['audio_port']
                    const audioKey = sessionInfo['audio_srtp']
                    const audioSsrc = sessionInfo['audio_ssrc']

                    const CMD = [];
                    // Input
                    CMD.push(this.config.liveStreamSource)
                    CMD.push('-map ' + this.config.mapVideo)
                    CMD.push('-vcodec ' + this.config.encoder)
                    CMD.push('-pix_fmt yuv420p')
                    CMD.push('-r ' + FPS)
                    CMD.push('-f rawvideo')
                    if(this.config.additionalCommandline.length>0)
                    {
                        CMD.push(this.config.additionalCommandline);
                    }
                    if(this.config.adhereToRequestedSize == 'true')
                    {
                        CMD.push('-vf scale=' + width + ':' + height)
                    }
                    CMD.push('-b:v ' + bitRate+'k')
                    CMD.push('-bufsize ' + bitRate+'k')
                    CMD.push('-maxrate ' + bitRate + 'k')
                    CMD.push('-payload_type 99')

                    // Output
                    CMD.push('-ssrc ' + videoSsrc)
                    CMD.push('-f rtp')
                    CMD.push('-srtp_out_suite AES_CM_128_HMAC_SHA1_80')
                    CMD.push('-srtp_out_params ' + videoKey.toString('base64'))
                    CMD.push('srtp://' + targetAddress + ':' + targetVideoPort + '?rtcpport=' + targetVideoPort + '&localrtcpport=' + targetVideoPort + '&pkt_size=' + this.config.packetSize)

                    // Audio ?
                    if(this.config.enableAudio == 'true')
                    {
                        // Input
                        CMD.push('-map ' + this.config.mapAudio)
                        CMD.push('-acodec ' + this.config.encoder_audio)
                        CMD.push('-profile:a aac_eld')
                        CMD.push('-flags +global_header')
                        CMD.push('-f null');
                        CMD.push('-ar '+aSampleRate+'k')
                        CMD.push('-b:a '+aBitRate+'k')
                        CMD.push('-bufsize '+aBitRate+'k')
                        CMD.push('-ac 1')
                        CMD.push('-payload_type 110')

                        // Output
                        CMD.push('-ssrc '+audioSsrc)
                        CMD.push('-f rtp')
                        CMD.push('-srtp_out_suite AES_CM_128_HMAC_SHA1_80')
                        CMD.push('-srtp_out_params '+audioKey.toString('base64'))
                        CMD.push('srtp://'+targetAddress+':'+targetAudioPort+'?rtcpport='+targetAudioPort+'&localrtcpport='+targetAudioPort+'&pkt_size='+this.config.packetSize)
                    }

                   

                    const ffmpeg = spawn(this.config.processor, CMD.join(' ').split(' '), { env: process.env, })

                  

                    ffmpeg.on('close', (c) =>
                    {
                        if (c != null && c == 0 && c == 255)
                        {
                            for (let i = 0; i < self.streamControllers.length; i++)
                            {
                                const controller = self.streamControllers[i]
                                if (controller.sessionIdentifier === sessionID)
                                {
                                    controller.forceStop()
                                }
                            }
                        }
                    });
                    
                    this.ongoingSessions[sessionIdentifier] = ffmpeg
                }
                break;
        }

        delete this.pendingSessions[sessionIdentifier]
    }
}


module.exports = {

    Camera: Camera,

}