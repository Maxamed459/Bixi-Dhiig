import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/notifications_controller.dart';
import '../core/theme.dart';
import '../models/app_notification.dart';
import '../widgets/app_card.dart';
import '../widgets/state_views.dart';
import 'request_detail_screen.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<NotificationsController>();
    return Scaffold(
      appBar: AppBar(
        title: Text('notifications'.tr),
        actions: [
          Obx(() => controller.unreadCount == 0
              ? const SizedBox.shrink()
              : TextButton(onPressed: controller.markAllRead, child: Text('mark_all_read'.tr))),
        ],
      ),
      body: Obx(() {
        if (controller.loading.value && controller.items.isEmpty) return const LoadingView();
        if (controller.error.value != null && controller.items.isEmpty) {
          return ErrorView(message: controller.error.value!, onRetry: controller.load);
        }
        if (controller.items.isEmpty) return EmptyView(icon: Icons.notifications_none, title: 'no_notifications'.tr);
        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: controller.load,
          child: ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: controller.items.length,
            itemBuilder: (_, index) => _NotificationCard(notification: controller.items[index]),
          ),
        );
      }),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  const _NotificationCard({required this.notification});
  final AppNotification notification;

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<NotificationsController>();
    return AppCard(
      margin: const EdgeInsets.only(bottom: 12),
      color: notification.isRead ? null : AppColors.primary.withValues(alpha: 0.07),
      onTap: () async {
        await controller.markRead(notification);
        if (notification.requestId != null) {
          Get.to(() => RequestDetailScreen(requestId: notification.requestId!));
        }
      },
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(notification.type == 'DONATION_PLEDGED' ? Icons.volunteer_activism : Icons.notifications_active, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(notification.title, style: const TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text(notification.body, style: const TextStyle(color: Colors.grey)),
          ])),
          if (!notification.isRead) const Icon(Icons.circle, size: 9, color: AppColors.primary),
        ],
      ),
    );
  }
}
