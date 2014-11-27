var Emitter   = require('wildemitter'),
    $         = require('jquery'),
    RecordRTC = require('recordrtc');

var $recordVideoButton = $('.js-record-video'),
    Owl = {};

navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

Owl.recorder = (function(rtc) {
  var module = {},
      stream,
      audioRecorder,
      videoRecorder;

  $.extend(module, new Emitter());

  function onGetUserMedia(mediaStream) {
    stream        = mediaStream;
    audioRecorder = rtc(stream, {type: 'audio', bufferSize: 16384});
    videoRecorder = rtc(stream, {type: 'video'});

    audioRecorder.startRecording();
    videoRecorder.startRecording();

    module.emit('start');
  }

  function onGetUserMediaError(error) {
    console.log(error);
  }

  module.toggleRecording = function() {
    if (stream) {
      this.stop();
    } else {
      this.start();
    }
  };

  module.start = function() {
    navigator.getUserMedia({audio: true, video: true}, onGetUserMedia, onGetUserMediaError);
  };

  module.stop = function() {
    stream.stop();
    stream = null;

    audioRecorder.stopRecording();
    videoRecorder.stopRecording();

    audioRecorder.getDataURL(function(audioDataURL) {
      videoRecorder.getDataURL(function(videoDataURL) {
        this.emit('stop', {audio: audioDataURL, video: videoDataURL});
      }.bind(this));
    }.bind(this));
  };

  return module;
})(RecordRTC);

Owl.uploader = (function($) {
  var module = {};

  $.extend(module, new Emitter());

  function onUploadMedia() {
    module.emit('upload', arguments);
  }

  function onUploadMediaError() {
    module.emit('error', arguments);
  }

  module.uploadMedia = function(media) {
    var xhr;

    xhr = $.ajax({
      url: 'http://192.168.1.90:8080/videos/',
      type: 'POST',
      data: media
    });

    xhr.done(onUploadMedia);
    xhr.fail(onUploadMediaError);
  };

  return module;
})($);


$(function() {
  Owl.recorder.on('start', function() {
    console.log('started');
  });
  Owl.recorder.on('stop', Owl.uploader.uploadMedia.bind(Owl.uploader));
  Owl.uploader.on('error', function(errorArgs) {
    console.log('upload error', errorArgs);
  });
  $recordVideoButton.on('click', Owl.recorder.toggleRecording.bind(Owl.recorder));
});
