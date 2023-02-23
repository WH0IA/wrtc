// Создаем объекты для видео и аудио
const constraints = {
    video: true,
    // audio: true
};
  
  // Получаем ссылки на видео элементы на странице
const localVideo = document.querySelector('#localVideo');
const remoteVideo = document.querySelector('#remoteVideo');

// Создаем объекты для соединения и передачи данных
const configuration = {
  iceServers: [{
    urls: 'stun:stun.l.google.com:19302' // STUN сервер для обхода NAT
  }]
};
const peerConnection = new RTCPeerConnection(configuration);
const dataChannel = peerConnection.createDataChannel('chat');

// Отображаем локальный видеопоток на странице
navigator.mediaDevices.getUserMedia(constraints)
  .then(localStream => {
    localVideo.srcObject = localStream ;
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
  })
  .catch(error => console.error('Ошибка получения локального видеопотока:', error));

// Отправляем и получаем ICE кандидатов для установки соединения
peerConnection.addEventListener('icecandidate', event => {
  if (event.candidate) {
    sendIceCandidate(event.candidate);
  }
});
function sendIceCandidate(candidate) {
  // Отправляем ICE кандидата на удаленный клиент
}

// Обрабатываем ICE кандидаты от удаленного клиента
function handleIceCandidate(candidate) {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

// Устанавливаем удаленный видеопоток после успешного соединения
peerConnection.addEventListener('track', event => {
  if (event.track.kind === 'video') {
    remoteVideo.srcObject = event.streams[0];
  }
});

// Устанавливаем соединение с удаленным клиентом
function connect() {
  // Получаем ссылку на удаленный клиент, например, через сигнальный сервер
  const remotePeer = new RTCPeerConnection(configuration);
  remotePeer.addEventListener('datachannel', event => {
    // Обрабатываем данные из канала связи
  });
  remotePeer.addEventListener('icecandidate', event => {
    if (event.candidate) {
      sendIceCandidate(event.candidate);
    }
  });
  remotePeer.addEventListener('track', event => {
    if (event.track.kind === 'video') {
      remoteVideo.srcObject = event.streams[0];
    }
  });

  // Создаем SDP предложение для установки соединения
  peerConnection.createOffer()
    .then(offer => {
      peerConnection.setLocalDescription(offer);
      remotePeer.setRemoteDescription(offer);
      return remotePeer.createAnswer();
    })
    .then(answer => {
      remotePeer.setLocalDescription(answer);
      peerConnection.setRemoteDescription(answer);
    })
    .catch(error => console.error('Ошибка установки соединения:', error));
}