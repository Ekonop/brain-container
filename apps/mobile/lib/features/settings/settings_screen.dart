import 'package:flutter/material.dart';

import '../../core/api_client.dart';
import '../../core/secure_store.dart';
import '../connect/connect_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String? _url;
  List<dynamic> _plugins = [];
  Map<String, dynamic>? _providers;
  Map<String, dynamic>? _health;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    _url = await SecureStore.instance.readBackendUrl();
    try {
      _health = await ApiClient.instance.health();
      _plugins = await ApiClient.instance.listPlugins();
      final provRes = await ApiClient.instance.dio.get('/providers');
      _providers = provRes.data as Map<String, dynamic>;
      _error = null;
    } catch (e) {
      _error = e.toString();
    }
    if (mounted) setState(() {});
  }

  Future<void> _disconnect() async {
    await SecureStore.instance.clear();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const ConnectScreen()), (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Connection', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 4),
          Text(_url ?? 'Not set'),
          const SizedBox(height: 4),
          Text('Backend: ${_health?["status"] ?? "unknown"}', style: const TextStyle(fontSize: 12)),
          Text('Provider: ${_health?["llm_provider"] ?? "unknown"}', style: const TextStyle(fontSize: 12)),
          Text('TPU: ${_health?["tpu_status"] ?? "unknown"}', style: const TextStyle(fontSize: 12)),
          const SizedBox(height: 12),
          FilledButton.tonal(onPressed: _load, child: const Text('Refresh')),
          const SizedBox(height: 8),
          OutlinedButton(onPressed: _disconnect, child: const Text('Disconnect')),
          const SizedBox(height: 24),
          Text('LLM Providers', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          if (_providers != null) ...[
            Text('Current: ${_providers!["current"]}', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            ...(_providers!["available"] as List).map((p) => Text('• $p', style: const TextStyle(fontSize: 12))),
          ],
          const SizedBox(height: 24),
          Text('Plugins', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ..._plugins.map((p) {
            final m = p as Map<String, dynamic>;
            return ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(m['name']?.toString() ?? ''),
              subtitle: Text(m['description']?.toString() ?? ''),
              trailing: Icon((m['enabled'] == true) ? Icons.check_circle : Icons.cancel_outlined,
                color: (m['enabled'] == true) ? Colors.green : Colors.grey),
            );
          }),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 12)),
          ],
        ],
      ),
    );
  }
}
