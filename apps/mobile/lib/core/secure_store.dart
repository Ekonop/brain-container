import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStore {
  SecureStore._();
  static final instance = SecureStore._();

  final _storage = const FlutterSecureStorage();

  static const _kBackendUrl = 'backend_url';
  static const _kApiKey = 'api_key';

  Future<void> saveConnection({required String backendUrl, required String apiKey}) async {
    await _storage.write(key: _kBackendUrl, value: backendUrl);
    await _storage.write(key: _kApiKey, value: apiKey);
  }

  Future<String?> readBackendUrl() => _storage.read(key: _kBackendUrl);
  Future<String?> readApiKey() => _storage.read(key: _kApiKey);

  Future<void> clear() async {
    await _storage.delete(key: _kBackendUrl);
    await _storage.delete(key: _kApiKey);
  }
}
