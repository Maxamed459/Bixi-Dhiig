import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/activity_controller.dart';
import '../controllers/auth_controller.dart';
import '../controllers/nav_controller.dart';
import '../controllers/requests_controller.dart';
import '../core/theme.dart';
import '../core/utils.dart';
import '../widgets/request_card.dart';
import 'create_request_screen.dart';
import 'request_detail_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Get.find<AuthController>();
    final requests = Get.find<RequestsController>();
    final activity = Get.find<ActivityController>();
    final nav = Get.find<NavController>();

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () async {
        await Future.wait([requests.load(), activity.load()]);
      },
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        children: [
          Obx(() {
            final name = auth.user.value?.displayName ?? '';
            return Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.primary.withValues(alpha: 0.14),
                  child: Text(initials(name),
                      style: const TextStyle(
                          color: AppColors.primary, fontWeight: FontWeight.w800)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('hello'.trParams({'name': name.split(' ').first}),
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                      Text('home_tagline'.tr,
                          style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            );
          }),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, AppColors.primaryDark],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Obx(() => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('donations_made'.tr,
                        style: const TextStyle(color: Colors.white70, fontSize: 14)),
                    const SizedBox(height: 4),
                    Text('${activity.completedDonations}',
                        style: const TextStyle(
                            color: Colors.white, fontSize: 48, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        _Stat(label: 'units_given'.tr, value: '${activity.unitsGiven}'),
                        const SizedBox(width: 12),
                        _Stat(label: 'active_requests'.tr, value: '${requests.total.value}'),
                      ],
                    ),
                  ],
                )),
          ),
          const SizedBox(height: 16),
          Obx(() {
            final canRequest = auth.user.value?.canRequest == true;
            return Row(
              children: [
                if (canRequest) ...[
                  Expanded(
                    child: _QuickAction(
                      icon: Icons.add_circle_outline,
                      label: 'request_blood'.tr,
                      onTap: () => Get.to(() => const CreateRequestScreen()),
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: _QuickAction(
                    icon: Icons.volunteer_activism_outlined,
                    label: 'find_to_donate'.tr,
                    onTap: () => nav.index.value = 1,
                  ),
                ),
              ],
            );
          }),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: Text('nearby_requests'.tr,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              ),
              TextButton(onPressed: () => nav.index.value = 1, child: Text('see_all'.tr)),
            ],
          ),
          const SizedBox(height: 8),
          Obx(() {
            if (requests.loading.value && requests.items.isEmpty) {
              return const Padding(
                padding: EdgeInsets.all(32),
                child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
              );
            }
            if (requests.items.isEmpty) {
              return Padding(
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: Text(requests.error.value ?? 'no_requests'.tr,
                      textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
                ),
              );
            }
            final top = requests.items.take(3).toList();
            return Column(
              children: [
                for (final r in top)
                  RequestCard(
                    request: r,
                    onTap: () => Get.to(() => RequestDetailScreen(requestId: r.id)),
                  ),
              ],
            );
          }),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.16),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value,
                style: const TextStyle(
                    color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({required this.icon, required this.label, required this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final dark = isDark(context);
    return Material(
      color: dark ? AppColors.darkCard : Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
          child: Column(
            children: [
              Icon(icon, color: AppColors.primary, size: 28),
              const SizedBox(height: 8),
              Text(label,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }
}
