import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/auth_controller.dart';
import '../widgets/app_button.dart';
import '../widgets/language_switcher.dart';

/// Shown when a HOSPITAL/ADMIN account signs in on the donor app.
class WebOnlyScreen extends StatelessWidget {
  const WebOnlyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Get.find<AuthController>();
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.desktop_windows_outlined, size: 68),
                const SizedBox(height: 18),
                Text('web_only_title'.tr,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
                const SizedBox(height: 10),
                Text('web_only_body'.tr,
                    textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
                const SizedBox(height: 24),
                const LanguageSwitcher(),
                const SizedBox(height: 24),
                AppButton(label: 'logout'.tr, outlined: true, onPressed: auth.logout),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
