import 'dart:ui';

import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/constants.dart';

class LocaleController extends GetxController {
  LocaleController(this._prefs) {
    code.value = _prefs.getString(AppConstants.prefLang) ?? 'en';
  }

  final SharedPreferences _prefs;
  final RxString code = 'en'.obs;

  Locale get locale => Locale(code.value);

  Future<void> change(String newCode) async {
    code.value = newCode;
    await _prefs.setString(AppConstants.prefLang, newCode);
    Get.updateLocale(Locale(newCode));
  }
}
