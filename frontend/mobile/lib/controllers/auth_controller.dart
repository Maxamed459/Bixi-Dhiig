import 'package:get/get.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../core/api_client.dart';
import '../core/constants.dart';
import '../core/token_storage.dart';
import '../core/utils.dart';
import '../models/json_utils.dart';
import '../models/user.dart';
import '../screens/login_screen.dart';
import '../screens/shell_screen.dart';
import '../screens/verify_email_screen.dart';
import '../screens/web_only_screen.dart';
import 'activity_controller.dart';
import 'nav_controller.dart';
import 'requests_controller.dart';

class AuthController extends GetxController {
  final ApiClient _api = ApiClient.instance;

  final Rxn<AppUser> user = Rxn<AppUser>();
  final RxBool busy = false.obs;
  final RxnString splashError = RxnString();

  bool _googleReady = false;

  @override
  void onInit() {
    super.onInit();
    _api.onSessionExpired = _onSessionExpired;
  }

  // ---------- session ----------

  Future<void> bootstrap() async {
    splashError.value = null;
    final access = await TokenStorage.readAccess();
    final refresh = await TokenStorage.readRefresh();
    if (access == null && refresh == null) {
      Get.offAll(() => const LoginScreen());
      return;
    }

    final r = await _api.get('/users/me');
    if (r.success && r.data is Map) {
      user.value = AppUser.fromJson(Map<String, dynamic>.from(r.data as Map));
      goHome();
    } else if (r.statusCode == 0 || r.statusCode >= 500) {
      splashError.value = r.displayMessage; // offline / server down: let the user retry
    } else {
      await _clearLocal();
      Get.offAll(() => const LoginScreen());
    }
  }

  void goHome() {
    final u = user.value;
    if (u == null) {
      Get.offAll(() => const LoginScreen());
    } else if (u.role != 'USER' && !u.canDonate && !u.canRequest) {
      Get.offAll(() => const WebOnlyScreen());
    } else if (!u.isEmailVerified) {
      Get.offAll(() => const VerifyEmailScreen());
    } else {
      Get.offAll(() => const ShellScreen());
    }
  }

  Future<void> _onSessionExpired() async {
    final wasSignedIn = user.value != null;
    await _clearLocal();
    Get.offAll(() => const LoginScreen());
    if (wasSignedIn) Toast.error('session_expired'.tr);
  }

  Future<void> _clearLocal() async {
    await TokenStorage.clear();
    user.value = null;
    if (Get.isRegistered<RequestsController>()) Get.delete<RequestsController>(force: true);
    if (Get.isRegistered<ActivityController>()) Get.delete<ActivityController>(force: true);
    if (Get.isRegistered<NavController>()) Get.delete<NavController>(force: true);
  }

  Future<bool> _acceptSession(dynamic data) async {
    final map = asMap(data);
    final userMap = asMap(map?['user']);
    final access = map?['accessToken']?.toString();
    if (map == null || userMap == null || access == null) {
      Toast.error('error_generic'.tr);
      return false;
    }
    await TokenStorage.save(access: access, refresh: map['refreshToken']?.toString());
    user.value = AppUser.fromJson(userMap);
    goHome();
    return true;
  }

  // ---------- auth actions ----------

  Future<void> login(String email, String password) async {
    busy.value = true;
    final r = await _api.post(
      '/auth/login',
      body: {'email': email.trim(), 'password': password},
      auth: false,
    );
    busy.value = false;
    if (!r.success) {
      Toast.error(r.displayMessage);
      return;
    }
    await _acceptSession(r.data);
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String bloodType,
    required String city,
  }) async {
    busy.value = true;
    final r = await _api.post(
      '/auth/register-user',
      body: {
        'display_name': name.trim(),
        'email': email.trim(),
        'password': password,
        'phone': phone.replaceAll(RegExp(r'[\s-]'), ''),
        'bloodType': bloodType,
        'city': city.trim(),
      },
      auth: false,
    );
    busy.value = false;
    if (!r.success) {
      Toast.error(r.displayMessage);
      return;
    }
    await _acceptSession(r.data);
  }

  Future<void> googleSignIn() async {
    busy.value = true;
    try {
      if (!_googleReady) {
        await GoogleSignIn.instance.initialize(serverClientId: AppConstants.googleServerClientId);
        _googleReady = true;
      }
      final account = await GoogleSignIn.instance.authenticate();
      final idToken = account.authentication.idToken;
      if (idToken == null) {
        busy.value = false;
        Toast.error('google_failed'.tr);
        return;
      }
      final r = await _api.post('/auth/google/mobile', body: {'idToken': idToken}, auth: false);
      busy.value = false;
      if (!r.success) {
        Toast.error(r.displayMessage);
        return;
      }
      await _acceptSession(r.data);
    } catch (_) {
      busy.value = false;
      Toast.error('google_failed'.tr);
    }
  }

  Future<void> verify(String code) async {
    busy.value = true;
    final r = await _api.post('/auth/verify', body: {'submittedCode': code.trim()});
    busy.value = false;
    if (!r.success) {
      Toast.error(r.displayMessage);
      return;
    }
    final updated = asMap(r.data);
    if (updated != null) user.value = AppUser.fromJson(updated);
    Toast.success('verified'.tr);
    goHome();
  }

  Future<void> resendCode() async {
    final r = await _api.post('/auth/resend-code');
    if (r.success) {
      Toast.success('code_sent'.tr);
    } else {
      Toast.error(r.displayMessage);
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> body) async {
    final r = await _api.patch('/users/me', body: body);
    if (!r.success) {
      Toast.error(r.displayMessage);
      return false;
    }
    final updated = asMap(r.data);
    if (updated != null) user.value = AppUser.fromJson(updated);
    return true;
  }

  Future<bool> changePassword(String current, String next) async {
    final r = await _api.post(
      '/auth/change-password',
      body: {'currentPassword': current, 'newPassword': next},
    );
    if (!r.success) {
      Toast.error(r.displayMessage);
      return false;
    }
    Toast.success('password_changed'.tr);
    return true;
  }

  Future<void> logout() async {
    final refresh = await TokenStorage.readRefresh();
    // Best effort: the local sign-out must work even when offline.
    await _api.post('/auth/logout', body: {'refreshToken': refresh});
    await _clearLocal();
    Get.offAll(() => const LoginScreen());
  }

  Future<void> deleteAccount() async {
    final r = await _api.post('/auth/delete-account');
    if (!r.success) {
      Toast.error(r.displayMessage);
      return;
    }
    await _clearLocal();
    Get.offAll(() => const LoginScreen());
  }
}
