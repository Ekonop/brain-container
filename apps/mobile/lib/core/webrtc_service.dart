import 'dart:async';
import 'dart:convert';

import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import 'api_client.dart';

/// WebRTC P2P connection manager for low-latency backend communication.
class WebRTCService {
  RTCPeerConnection? _pc;
  RTCDataChannel? _dc;
  WebSocketChannel? _signal;
  bool _connected = false;

  bool get isConnected => _connected;

  /// Initialize P2P connection. Returns true if P2P succeeds, false if fallback needed.
  Future<bool> connect(String backendUrl, String apiKey) async {
    try {
      // Get ICE config from backend
      final config = await ApiClient.instance.dio.get('/webrtc/config');
      final iceServers = (config.data['iceServers'] as List)
          .map((s) => {'urls': s['urls']})
          .toList();

      final pcConfig = {'iceServers': iceServers};
      _pc = await createPeerConnection(pcConfig);

      // Create data channel for messaging
      _dc = await _pc!.createDataChannel('chat', RTCDataChannelInit());
      _dc!.onMessage = (RTCDataChannelMessage msg) {
        // Handle incoming messages
      };

      // Set up signaling via WebSocket
      final wsUrl = backendUrl.replaceFirst('http', 'ws') + '/webrtc/signal/p2p-session';
      _signal = WebSocketChannel.connect(Uri.parse(wsUrl));

      // Create offer
      final offer = await _pc!.createOffer();
      await _pc!.setLocalDescription(offer);

      // Send offer
      _signal!.sink.add(jsonEncode({'role': 'caller', 'offer': offer.sdp}));

      // Wait for answer
      final answerCompleter = Completer<String>();
      _signal!.stream.listen((msg) {
        final data = jsonDecode(msg);
        if (data['type'] == 'answer') {
          answerCompleter.complete(data['sdp']);
        } else if (data['type'] == 'ice') {
          _pc!.addCandidate(RTCIceCandidate(
            data['candidate']['candidate'],
            data['candidate']['sdpMid'],
            data['candidate']['sdpMLineIndex'],
          ));
        }
      });

      final answerSdp = await answerCompleter.future.timeout(const Duration(seconds: 10));
      await _pc!.setRemoteDescription(RTCSessionDescription(answerSdp, 'answer'));

      // Send ICE candidates
      _pc!.onIceCandidate = (RTCIceCandidate candidate) {
        _signal!.sink.add(jsonEncode({'type': 'ice', 'candidate': {
          'candidate': candidate.candidate,
          'sdpMid': candidate.sdpMid,
          'sdpMLineIndex': candidate.sdpMLineIndex,
        }}));
      };

      _connected = true;
      return true;
    } catch (e) {
      _connected = false;
      return false;
    }
  }

  void sendMessage(String message) {
    if (_dc != null && _connected) {
      _dc!.send(RTCDataChannelMessage(message));
    }
  }

  void disconnect() {
    _dc?.close();
    _pc?.close();
    _signal?.sink.close();
    _connected = false;
  }
}
