import 'dart:io';

import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../core/api_client.dart';

class CollectionsScreen extends StatefulWidget {
  const CollectionsScreen({super.key});

  @override
  State<CollectionsScreen> createState() => _CollectionsScreenState();
}

class _CollectionsScreenState extends State<CollectionsScreen> {
  static const boxName = 'offline_upload_queue';

  Future<void> _pickAndUpload() async {
    final result = await FilePicker.platform.pickFiles(withData: false);
    if (result == null || result.files.isEmpty) return;
    final path = result.files.single.path;
    if (path == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not read file path.')),
      );
      return;
    }

    try {
      final form = FormData.fromMap({
        'file': await MultipartFile.fromFile(path, filename: result.files.single.name),
      });
      final res = await ApiClient.instance.dio.post('/ingest', data: form);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Uploaded: ${res.data}')),
      );
    } catch (e) {
      // Queue offline
      final box = Hive.box(boxName);
      await box.add({'path': path, 'name': result.files.single.name, 'ts': DateTime.now().toIso8601String()});
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Offline or failed; queued locally: $e')),
      );
    }
  }

  Future<void> _syncQueue() async {
    final box = Hive.box(boxName);
    if (box.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Queue empty.')));
      return;
    }
    var synced = 0;
    final keys = box.keys.toList();
    for (final k in keys) {
      final item = Map<String, dynamic>.from(box.get(k) as Map);
      final path = item['path'] as String?;
      if (path == null || !File(path).existsSync()) {
        await box.delete(k);
        continue;
      }
      try {
        final form = FormData.fromMap({
          'file': await MultipartFile.fromFile(path, filename: item['name'] as String? ?? 'file'),
        });
        await ApiClient.instance.dio.post('/ingest', data: form);
        await box.delete(k);
        synced++;
      } catch (_) {
        // keep in queue
      }
    }
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Synced $synced item(s).')));
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Collections')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Upload documents to ingest into the backend (RAG). Failed uploads are queued locally (Hive) for retry.',
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _pickAndUpload,
              icon: const Icon(Icons.upload_file),
              label: const Text('Pick & upload file'),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: _syncQueue,
              icon: const Icon(Icons.sync),
              label: const Text('Sync offline queue'),
            ),
            const SizedBox(height: 24),
            const Text('Offline queue', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Expanded(
              child: ValueListenableBuilder(
                valueListenable: Hive.box(boxName).listenable(),
                builder: (context, Box box, _) {
                  if (box.isEmpty) {
                    return const Text('No queued uploads.');
                  }
                  return ListView.builder(
                    itemCount: box.length,
                    itemBuilder: (context, i) {
                      final item = Map<String, dynamic>.from(box.getAt(i) as Map);
                      return ListTile(
                        dense: true,
                        title: Text(item['name']?.toString() ?? 'file'),
                        subtitle: Text(item['ts']?.toString() ?? ''),
                      );
                    },
                  );
                },
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Source citations: shown in Chat responses when the backend returns `sources`.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
