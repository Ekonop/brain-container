import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'core/api_client.dart';
import 'features/connect/connect_screen.dart';
import 'features/home/home_shell.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  await Hive.openBox('offline_upload_queue');
  await ApiClient.instance.configureFromStorage();
  runApp(const ProviderScope(child: BrainContainerApp()));
}

class BrainContainerApp extends StatelessWidget {
  const BrainContainerApp({super.key});

  @override
  Widget build(BuildContext context) {
    final configured = ApiClient.instance.isConfigured;
    return MaterialApp(
      title: 'Brain Container',
      theme: ThemeData(colorSchemeSeed: Colors.teal, useMaterial3: true),
      home: configured ? const HomeShell() : const ConnectScreen(),
    );
  }
}
