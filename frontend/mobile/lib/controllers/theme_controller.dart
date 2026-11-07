import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/constants.dart';

class ThemeController extends GetxController {
  ThemeController(this._prefs) {
    mode.value = _prefs.getString(AppConstants.prefTheme) ?? 'system';
  }

  final SharedPreferences _prefs;
  final RxString mode = 'system'.obs;

  ThemeMode get themeMode => switch (mode.value) {
        'light' => ThemeMode.light,
        'dark' => ThemeMode.dark,
        _ => ThemeMode.system,
      };

  Future<void> change(String value) async {
    mode.value = value;
    await _prefs.setString(AppConstants.prefTheme, value);
  }
}
