import 'package:device_preview/device_preview.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'controllers/auth_controller.dart';
import 'controllers/locale_controller.dart';
import 'core/theme.dart';
import 'l10n/fallback_delegates.dart';
import 'l10n/translations.dart';
import 'screens/splash_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting();
  final prefs = await SharedPreferences.getInstance();
  Get.put(LocaleController(prefs), permanent: true);
  Get.put(AuthController(), permanent: true);

  runApp(
    // DevicePreview(enabled: !kReleaseMode, builder: (context) => const BixiDhiigApp()),
    BixiDhiigApp(),
  );
}

class BixiDhiigApp extends StatelessWidget {
  const BixiDhiigApp({super.key});

  @override
  Widget build(BuildContext context) {
    final locale = Get.find<LocaleController>().locale;
    return GetMaterialApp(
      title: 'Bixi-Dhiig',
      debugShowCheckedModeBanner: false,
      translations: AppTranslations(),
      locale: locale,
      fallbackLocale: const Locale('en'),
      supportedLocales: [
        for (final l in AppTranslations.supported) Locale(l['code']!),
      ],
      localizationsDelegates: appLocalizationDelegates,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.system,
      useInheritedMediaQuery: true,
      builder: DevicePreview.appBuilder,
      home: const SplashScreen(),
    );
  }
}
