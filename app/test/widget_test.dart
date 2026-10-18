import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app/features/student/presentation/screens/student_shell_screen.dart';

void main() {
  testWidgets('Renders StudentShellScreen and switches tabs', (WidgetTester tester) async {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: const MaterialApp(
          home: StudentShellScreen(),
        ),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    // Select Grades tab (index 2)
    container.read(studentTabProvider.notifier).state = 2;
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Grades & Report Card'), findsOneWidget);
    expect(find.text("Dean's Honor Roll"), findsOneWidget);

    // Select Fees tab (index 4)
    container.read(studentTabProvider.notifier).state = 4;
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Fee & Billing Portal'), findsOneWidget);
  });
}
