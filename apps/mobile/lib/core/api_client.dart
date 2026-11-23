import 'package:dio/dio.dart';
import 'secure_store.dart';

class ApiClient {
  ApiClient._();
  static final instance = ApiClient._();

  Dio? _dio;
  String? _baseUrl;

  Future<void> configureFromStorage() async {
    final url = await SecureStore.instance.readBackendUrl();
    final key = await SecureStore.instance.readApiKey();
    if (url == null || key == null) {
      _dio = null;
      _baseUrl = null;
      return;
    }
    _baseUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl!,
      headers: {'X-API-Key': key},
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 60),
    ));
  }

  bool get isConfigured => _dio != null;
  String? get baseUrl => _baseUrl;

  Dio get dio {
    final d = _dio;
    if (d == null) {
      throw StateError('API client not configured. Connect first.');
    }
    return d;
  }

  Future<Map<String, dynamic>> health() async {
    final res = await dio.get('/health');
    return res.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> listPlugins() async {
    final res = await dio.get('/plugins');
    return res.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> query(String queryText, {String? collectionId}) async {
    final res = await dio.post('/query', data: {
      'query': queryText,
      if (collectionId != null) 'collection_id': collectionId,
    });
    return res.data as Map<String, dynamic>;
  }
}
