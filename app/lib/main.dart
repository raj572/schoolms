import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/theme.dart';
import 'routing/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: EduPulseApp(),
    ),
  );
}

class EduPulseApp extends ConsumerWidget {
  const EduPulseApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Learnaz - School Management',
      debugShowCheckedModeBanner: false,
      theme: EduPulseTheme.lightTheme,
      routerConfig: router,
    );
  }
}
