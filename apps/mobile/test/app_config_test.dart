import 'package:brain_container_mobile/core/config.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('default backend url is set', () {
    expect(AppConfig.defaultBackendUrl, isNotEmpty);
    expect(AppConfig.defaultBackendUrl, contains('http'));
  });
}
