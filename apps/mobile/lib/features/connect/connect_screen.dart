import 'package:flutter/material.dart';
import '../../core/api_client.dart';
import '../../core/secure_store.dart';
import '../home/home_shell.dart';

class ConnectScreen extends StatefulWidget {
  const ConnectScreen({super.key});

  @override
  State<ConnectScreen> createState() => _ConnectScreenState();
}

class _ConnectScreenState extends State<ConnectScreen> {
  final _urlCtrl = TextEditingController(text: 'http://localhost:8000');
  final _keyCtrl = TextEditingController(text: 'dev-key');
  bool _loading = false;
  String? _error;

  Future<void> _connect() async {
    setState(() { _loading = true; _error = null; });
    try {
      var url = _urlCtrl.text.trim();
      if (url.endsWith('/')) url = url.substring(0, url.length - 1);
      final key = _keyCtrl.text.trim();
      if (url.isEmpty || key.isEmpty) throw Exception('URL and API key are required.');
      await SecureStore.instance.saveConnection(backendUrl: url, apiKey: key);
      await ApiClient.instance.configureFromStorage();
      if (!mounted) return;
      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const HomeShell()));
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() { _urlCtrl.dispose(); _keyCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Connect to Brain Container')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Pairing', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Local: use LAN IP (e.g. http://192.168.1.10:8000). Remote: use Cloudflare Tunnel URL.',
            style: TextStyle(fontSize: 13)),
          const SizedBox(height: 16),
          TextField(controller: _urlCtrl, decoration: const InputDecoration(labelText: 'Backend URL', border: OutlineInputBorder()), keyboardType: TextInputType.url),
          const SizedBox(height: 12),
          TextField(controller: _keyCtrl, decoration: const InputDecoration(labelText: 'API Key (X-API-Key)', border: OutlineInputBorder()), obscureText: true),
          const SizedBox(height: 16),
          if (_error != null) Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(_error!, style: const TextStyle(color: Colors.red))),
          FilledButton.icon(onPressed: _loading ? null : _connect,
            icon: _loading ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.link),
            label: const Text('Connect')),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () {
              // QR scan: decode JSON {backend_url, api_key}
              showDialog(context: context, builder: (ctx) => AlertDialog(
                title: const Text('QR Scan'),
                content: const Text('Scan a QR code encoding: {"backend_url":"...","api_key":"..."}\n\nIntegrate mobile_scanner package for camera scanning.'),
                actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('OK'))],
              ));
            },
            icon: const Icon(Icons.qr_code_scanner),
            label: const Text('Scan QR Code'),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () {
              _urlCtrl.text = 'https://';
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter your Cloudflare Tunnel URL above.')));
            },
            icon: const Icon(Icons.cloud),
            label: const Text('Use Cloudflare Tunnel'),
          ),
        ],
      ),
    );
  }
}
