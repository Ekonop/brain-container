import 'package:brain_container_mobile/features/connect/connect_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('ConnectScreen shows key fields', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: ConnectScreen()));
    expect(find.text('Connect to Brain Container'), findsOneWidget);
    expect(find.text('Backend URL'), findsOneWidget);
    expect(find.text('API Key (X-API-Key)'), findsOneWidget);
    expect(find.text('Connect'), findsOneWidget);
    expect(find.text('Scan QR Code'), findsOneWidget);
  });
}
