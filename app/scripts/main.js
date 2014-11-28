var Emitter   = require('wildemitter'),
    $         = require('jquery'),
    RecordRTC = require('recordrtc'),
    Owl       = {};

navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

Owl.recorder = (function(rtc) {
  var module = {},
      stream,
      audioRecorder,
      videoRecorder,
      audioURL,
      videoURL;

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

    return false;
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
        audioURL = audioDataURL;
        videoURL = videoDataURL;

        this.emit('stop');
      }.bind(this));
    }.bind(this));
  };

  module.getAudioURL = function() {
    return audioURL;
  };

  module.getVideoURL = function() {
    return videoURL;
  };

  return module;
})(RecordRTC);

Owl.playback = (function() {
  var module = {};

  $.extend(module, new Emitter());

  module.loadMedia = function(audioDataURL, videoDataURL, $playbackSection) {
    var video, audio;

    $video = $playbackSection.find('video');
    $video[0].src = videoDataURL;
    $audio = $playbackSection.find('audio');
    $audio[0].src = audioDataURL;

    $video.on('play', function() {
      $audio[0].play();
      $audio[0].currentTime = $video[0].currentTime;
    });

    $video.on('pause', function() {
      $audio[0].pause();
    });

    this.emit('load');
  };

  return module;
})();

Owl.uploader = (function($) {
  var module = {};

  $.extend(module, new Emitter());

  function onUploadMedia() {
    module.emit('upload');
  }

  function onUploadMediaError(xhr, errorText, error) {
    module.emit('error');
  }

  module.uploadMedia = function(audioDataURL, videoDataURL) {
    var xhr;

    xhr = $.ajax({
      url: 'http://api.ph.cantorandball.com/videos',
      type: 'POST',
      data: {
        audio: audioDataURL,
        video: videoDataURL
      }
    });

    xhr.done(onUploadMedia);
    xhr.fail(onUploadMediaError);
  };

  return module;
})($);


$(function() {
  var $recorderSection      = $('.recorder'),
      $playbackSection      = $('.playback'),
      $uploadingSection     = $('.uploading'),
      $uploadedSection      = $('.uploaded'),
      $recorderSectionTitle = $recorderSection.find('h1'),
      $playbackSectionTitle = $playbackSection.find('h1'),
      $recordVideoButton    = $('.js-record-video'),
      $cancelVideoButton    = $('.js-cancel-video'),
      $uploadVideoButton    = $('.js-upload-video'),
      $newStoryLink         = $('.js-new-story'),
      recordIconClass       = 'icon-videocam',
      stopIconClass         = 'icon-stop';

  function makeVisible($element) {
    $element.addClass('visible');
  }

  function makeInvisible($element) {
    $element.removeClass('visible');
  }

  /**
  Recorder UI changes
  */

  Owl.recorder.on('start', function() {
    $recorderSectionTitle.text('Recording…');
    $recordVideoButton.find('i').removeClass(recordIconClass).addClass(stopIconClass);
  });

  Owl.recorder.on('stop', function() {
    Owl.playback.loadMedia(Owl.recorder.getAudioURL(),
                           Owl.recorder.getVideoURL(),
                           $playbackSection);

    makeInvisible($recorderSection);
    makeVisible($playbackSection);

    $recorderSectionTitle.text('Record your story');
    $recordVideoButton.find('i').removeClass(stopIconClass).addClass(recordIconClass);
  });

  Owl.uploader.on('upload', function() {
    makeInvisible($uploadingSection);
    makeVisible($uploadedSection);
  });

  Owl.uploader.on('error', function(errorArgs) {
    console.log('upload error', errorArgs);
  });

  /**
  UI action bindings
  */

  $recordVideoButton.on('click', Owl.recorder.toggleRecording.bind(Owl.recorder));

  $cancelVideoButton.on('click', function() {
    makeInvisible($playbackSection);
    makeVisible($recorderSection);
  });

  $uploadVideoButton.on('click', function() {
    makeInvisible($playbackSection);
    makeVisible($uploadingSection);

    Owl.uploader.uploadMedia(Owl.recorder.getAudioURL,
                             Owl.recorder.getVideoURL);
  });

  $newStoryLink.on('click', function(e) {
    e.preventDefault();
    makeInvisible($uploadedSection);
    makeVisible($recorderSection);
  });
});
