import 'dart:async';

import 'package:get/get.dart';

import '../core/api_client.dart';
import '../models/app_notification.dart';
import '../core/utils.dart';

class NotificationsController extends GetxController {
  final ApiClient _api = ApiClient.instance;
  final RxList<AppNotification> items = <AppNotification>[].obs;
  final RxBool loading = false.obs;
  final RxnString error = RxnString();
  Timer? _poller;

  int get unreadCount => items.where((item) => !item.isRead).length;

  @override
  void onInit() {
    super.onInit();
    load();
    _poller = Timer.periodic(const Duration(seconds: 30), (_) => load());
  }

  @override
  void onClose() {
    _poller?.cancel();
    super.onClose();
  }

  Future<void> load() async {
    loading.value = true;
    error.value = null;
    final response = await _api.get('/notifications');
    if (response.success && response.data is List) {
      items.assignAll((response.data as List)
          .whereType<Map>()
          .map((item) => AppNotification.fromJson(Map<String, dynamic>.from(item))));
    } else if (!response.success) {
      error.value = response.displayMessage;
    }
    loading.value = false;
  }

  Future<void> markRead(AppNotification notification) async {
    if (notification.isRead) return;
    final response = await _api.patch('/notifications/${notification.id}/read');
    if (response.success) {
      final index = items.indexWhere((item) => item.id == notification.id);
      if (index >= 0) {
        final updated = AppNotification(
          id: notification.id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          requestId: notification.requestId,
          donationId: notification.donationId,
          createdAt: notification.createdAt,
          readAt: DateTime.now(),
        );
        items[index] = updated;
      }
    }
  }

  Future<void> markAllRead() async {
    final response = await _api.patch('/notifications/read-all');
    if (response.success) {
      items.assignAll(items.map((item) => AppNotification(
            id: item.id,
            type: item.type,
            title: item.title,
            body: item.body,
            requestId: item.requestId,
            donationId: item.donationId,
            createdAt: item.createdAt,
            readAt: item.readAt ?? DateTime.now(),
          )));
    } else {
      Toast.error(response.displayMessage);
    }
  }
}
