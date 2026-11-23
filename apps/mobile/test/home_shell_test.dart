import 'package:brain_container_mobile/features/home/home_shell.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('HomeShell shows navigation destinations', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: HomeShell()),
    );

    expect(find.text('Chat'), findsWidgets); // may appear in nav and app bar context depending; but nav labels exist
    expect(find.text('Collections'), findsWidgets);
    expect(find.text('Settings'), findsWidgets);
  });
}
