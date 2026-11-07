import 'package:get/get.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';

import '../core/constants.dart';
import '../screens/request_detail_screen.dart';

class PushNotificationService {
  PushNotificationService._();
  static final PushNotificationService instance = PushNotificationService._();

  bool _started = false;

  Future<void> initialize() async {
    if (_started || AppConstants.oneSignalAppId == 'YOUR_ONESIGNAL_APP_ID') return;
    _started = true;

    OneSignal.Debug.setLogLevel(OSLogLevel.warn);
    OneSignal.initialize(AppConstants.oneSignalAppId);
    OneSignal.Notifications.addClickListener((event) {
      final requestId = event.notification.additionalData?['requestId'];
      if (requestId is String && requestId.isNotEmpty) {
        Get.to(() => RequestDetailScreen(requestId: requestId));
      }
    });

    await OneSignal.Notifications.requestPermission(false);
  }

  Future<void> identifyUser(String userId) async {
    if (!_started || userId.isEmpty) return;
    await OneSignal.login(userId);
  }

  Future<void> clearUser() async {
    if (!_started) return;
    await OneSignal.logout();
  }
}
