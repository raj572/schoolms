import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app/features/student/presentation/screens/student_grades_screen.dart';
import 'package:app/features/student/presentation/screens/student_fees_screen.dart';
import 'package:app/features/student/presentation/screens/student_shell_screen.dart';
import 'package:app/features/student/presentation/controllers/student_controller.dart';

void main() {
  testWidgets('Test StudentGradesScreen directly with mocked providers', (WidgetTester tester) async {

    final mockDashboard = {
      'student_info': {
        'id': 1,
        'name': 'Alex Doe',
        'class': '10',
        'section': 'A',
      },
      'class_details': {
        'class_id': 1,
        'class': '10',
        'section': 'A',
        'room_no': '101',
        'teacher_in_charge': 'Teacher One',
      },
    };

    final container = ProviderContainer(
      overrides: [
        studentDashboardProvider.overrideWith((ref) async => mockDashboard),
      ],
    );
    addTearDown(container.dispose);

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: const MaterialApp(
          home: StudentGradesScreen(),
        ),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.byType(StudentGradesScreen), findsOneWidget);
  });

  testWidgets('Test StudentFeesScreen directly with mocked providers', (WidgetTester tester) async {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: const MaterialApp(
          home: StudentFeesScreen(),
        ),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.byType(StudentFeesScreen), findsOneWidget);
  });

  testWidgets('Test StudentShellScreen tab switching to Grades and Fees', (WidgetTester tester) async {
    final mockDashboard = {
      'student_info': {
        'id': 1,
        'name': 'Alex Doe',
        'class': '10',
        'section': 'A',
      },
      'class_details': {
        'class_id': 1,
        'class': '10',
        'section': 'A',
        'room_no': '101',
        'teacher_in_charge': 'Teacher One',
      },
    };

    final container = ProviderContainer(
      overrides: [
        studentDashboardProvider.overrideWith((ref) async => mockDashboard),
      ],
    );
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

    // Tap on Grades tab (icon with school)
    await tester.tap(find.text('Grades'));
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.byType(StudentGradesScreen), findsOneWidget);
    expect(find.text('Term 2 (Current)'), findsOneWidget);

    // Tap on Fees tab (icon with account_balance_wallet)
    await tester.tap(find.text('Fees'));
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.byType(StudentFeesScreen), findsOneWidget);
    expect(find.text('Pending Dues'), findsOneWidget);
  });
}

