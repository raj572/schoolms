import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/theme.dart';
import 'routing/app_router.dart';

class AppScrollBehavior extends MaterialScrollBehavior {
  @override
  Set<PointerDeviceKind> get dragDevices => {
    PointerDeviceKind.touch,
    PointerDeviceKind.mouse,
    PointerDeviceKind.trackpad,
    PointerDeviceKind.stylus,
  };
}

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
      scrollBehavior: AppScrollBehavior(),
      theme: EduPulseTheme.lightTheme,
      routerConfig: router,
    );
  }
}
