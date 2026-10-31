import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/locale_controller.dart';
import '../l10n/translations.dart';

class LanguageSwitcher extends StatelessWidget {
  const LanguageSwitcher({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.find<LocaleController>();
    return Obx(
      () => SegmentedButton<String>(
        showSelectedIcon: false,
        segments: [
          for (final l in AppTranslations.supported)
            ButtonSegment<String>(value: l['code']!, label: Text(l['name']!)),
        ],
        selected: {c.code.value},
        onSelectionChanged: (s) => c.change(s.first),
      ),
    );
  }
}
