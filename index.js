const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');

let localStream;
let remoteStream;
let pc1;
let pc2;

const offerOptions = {
  offerToReceiveVideo: 1,
  offerToReceiveAudio: 1
};

const constraints = {
  video: true,
  audio: false
};

startButton.addEventListener('click', start);
callButton.addEventListener('click', call);
hangupButton.addEventListener('click', hangup);

async function start() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localVideo.srcObject = localStream;
  } catch (error) {
    console.error('Ошибка получения медиа-устройств', error);
  }
}

async function call() {
  try {
    pc1 = new RTCPeerConnection();
    pc2 = new RTCPeerConnection();

    pc1.addEventListener('icecandidate', e => onIceCandidate(pc1, e));
    pc2.addEventListener('icecandidate', e => onIceCandidate(pc2, e));
    pc2.addEventListener('track', gotRemoteStream);

    localStream.getTracks().forEach(track => {
      pc1.addTrack(track, localStream);
    });

    const offer = await pc1.createOffer(offerOptions);
    await onCreateOfferSuccess(offer);
  } catch (error) {
    console.error('Ошибка установки соединения', error);
  }
}

async function hangup() {
  try {
    pc1.close();
    pc2.close();
    pc1 = null;
    pc2 = null;
  } catch (error) {
    console.error('Ошибка завершения соединения', error);
  }
}

async function onCreateOfferSuccess(offer) {
  try {
    await pc1.setLocalDescription(offer);
    await pc2.setRemoteDescription(offer);

    const answer = await pc2.createAnswer();
    await onCreateAnswerSuccess(answer);
  } catch (error) {
    console.error('Ошибка создания offer', error);
  }
}

async function onCreateAnswerSuccess(answer) {
  try {
    await pc2.setLocalDescription(answer);
    await pc1.setRemoteDescription(answer);
  } catch (error) {
    console.error('Ошибка создания answer', error);
  }
}

function onIceCandidate(pc, event) {
  try {
    const candidate = event.candidate;

    if (candidate) {
      const otherPc = pc === pc1 ? pc2 : pc1;
      otherPc.addIceCandidate(candidate);
    }
  } catch (error) {
    console.error('Ошибка отправки ICE кандидата', error);
  }
}

function gotRemoteStream(event) {
  remoteVideo.srcObject = event.streams[0];
}