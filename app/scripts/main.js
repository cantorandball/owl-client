navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

var video = document.querySelector('video'),
    captureToggleButton = document.querySelector('.control-capture-toggle'),
    constraints = {
      video: true,
      audio: true
    },
    avRecorder,
    stream;

function startRecording() {
  function onSuccess(stream) {
    window.stream = stream;
    avRecorder = RecordRTC(stream);
    avRecorder.startRecording();
    captureToggleButton.textContent = 'Stop Recording';
  }

  function onError(e) {
    console.log('error', e);
  }

  navigator.getUserMedia(constraints, onSuccess, onError);
}

function stopRecording() {
  stream.stop();

  avRecorder.stopRecording(function(url) {
    avRecorder.getDataURL(function(dataURL) {
      sendDataXhr(dataURL);
    });
  });
  captureToggleButton.textContent = 'Start Recording';
}

function sendDataXhr(audio) {
  var media = { audio: audio },
      xhr = $.ajax({
        url: 'http://192.168.1.90:8080/videos/',
        type: 'POST',
        data: media
      });

  xhr.done(function() {
    console.log('success', arguments);
  });

  xhr.fail(function() {
    console.log('fail', arguments)
  });
}

captureToggleButton.addEventListener('click', function() {
  if (stream) {
    stopRecording();
  } else {
    startRecording();
  }
}, false);
