import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../../core/api_client.dart';
import '../../core/secure_store.dart';
import '../../core/webrtc_service.dart';

class ChatMessage {
  ChatMessage({required this.role, required this.content, this.toolsUsed = const [], this.sources = const []});
  final String role;
  final String content;
  final List<String> toolsUsed;
  final List<String> sources;
}

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollCtrl = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _sending = false;
  bool _useWebSocket = false;
  final WebRTCService _webrtc = WebRTCService();

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() {
      _sending = true;
      _messages.add(ChatMessage(role: 'user', content: text));
      _controller.clear();
    });
    _scrollToBottom();
    try {
      final res = await ApiClient.instance.query(text);
      final answer = res['answer']?.toString() ?? '';
      final tools = (res['tools_used'] as List?)?.map((e) => e.toString()).toList() ?? <String>[];
      final sources = (res['sources'] as List?)?.map((e) => e.toString()).toList() ?? <String>[];
      setState(() {
        _messages.add(ChatMessage(role: 'assistant', content: answer, toolsUsed: tools, sources: sources));
      });
    } catch (e) {
      setState(() {
        _messages.add(ChatMessage(role: 'assistant', content: 'Error: $e'));
      });
    } finally {
      if (mounted) setState(() => _sending = false);
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(_scrollCtrl.position.maxScrollExtent,
            duration: const Duration(milliseconds: 200), curve: Curves.easeOut);
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollCtrl.dispose();
    _webrtc.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat'),
        actions: [
          IconButton(
            icon: Icon(_webrtc.isConnected ? Icons.link : Icons.link_off),
            tooltip: _webrtc.isConnected ? 'P2P Connected' : 'Using Tunnel',
            onPressed: () async {
              final url = await SecureStore.instance.readBackendUrl();
              final key = await SecureStore.instance.readApiKey();
              if (url != null && key != null) {
                final ok = await _webrtc.connect(url, key);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(ok ? 'P2P connected!' : 'P2P failed, using tunnel')),
                  );
                }
                setState(() {});
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollCtrl,
              padding: const EdgeInsets.all(12),
              itemCount: _messages.length,
              itemBuilder: (context, i) {
                final m = _messages[i];
                final isUser = m.role == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.85),
                    decoration: BoxDecoration(
                      color: isUser ? Theme.of(context).colorScheme.primaryContainer : Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (m.toolsUsed.isNotEmpty) ...[
                          Wrap(
                            spacing: 6, runSpacing: 4,
                            children: m.toolsUsed.map((t) => Chip(
                              label: Text(t, style: const TextStyle(fontSize: 11)),
                              visualDensity: VisualDensity.compact,
                              avatar: const Icon(Icons.build, size: 14),
                            )).toList(),
                          ),
                          const SizedBox(height: 6),
                        ],
                        isUser ? Text(m.content) : MarkdownBody(data: m.content),
                        if (m.sources.isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Text('Sources: ${m.sources.join(", ")}',
                            style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(hintText: 'Ask something...', border: OutlineInputBorder()),
                    minLines: 1, maxLines: 4,
                    onSubmitted: (_) => _send(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(onPressed: _sending ? null : _send, icon: const Icon(Icons.send)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
