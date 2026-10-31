import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/activity_controller.dart';
import '../core/theme.dart';
import '../core/utils.dart';
import '../models/donation.dart';
import '../widgets/app_card.dart';
import '../widgets/badges.dart';
import '../widgets/request_card.dart';
import '../widgets/state_views.dart';
import 'request_detail_screen.dart';

class ActivityScreen extends StatelessWidget {
  const ActivityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.find<ActivityController>();
    return DefaultTabController(
      length: 2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
            child: Text('activity_title'.tr,
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          ),
          TabBar(
            labelColor: AppColors.primary,
            indicatorColor: AppColors.primary,
            tabs: [
              Tab(text: 'my_requests'.tr),
              Tab(text: 'my_donations'.tr),
            ],
          ),
          Expanded(
            child: Obx(() {
              if (c.loading.value && c.myRequests.isEmpty && c.myDonations.isEmpty) {
                return const LoadingView();
              }
              if (c.error.value != null && c.myRequests.isEmpty && c.myDonations.isEmpty) {
                return ErrorView(message: c.error.value!, onRetry: c.load);
              }
              return TabBarView(
                children: [
                  _RequestsTab(c: c),
                  _DonationsTab(c: c),
                ],
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _RequestsTab extends StatelessWidget {
  const _RequestsTab({required this.c});

  final ActivityController c;

  @override
  Widget build(BuildContext context) {
    return Obx(() => RefreshIndicator(
      color: AppColors.primary,
      onRefresh: c.load,
      child: c.myRequests.isEmpty
          ? ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                SizedBox(
                  height: 320,
                  child: EmptyView(
                      icon: Icons.bloodtype_outlined, title: 'no_my_requests'.tr),
                ),
              ],
            )
          : ListView.builder(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(20),
              itemCount: c.myRequests.length,
              itemBuilder: (context, i) {
                final r = c.myRequests[i];
                return RequestCard(
                  request: r,
                  trailing: StatusBadge(r.status),
                  onTap: () => Get.to(() => RequestDetailScreen(requestId: r.id)),
                );
              },
            ),
    ));
  }
}

class _DonationsTab extends StatelessWidget {
  const _DonationsTab({required this.c});

  final ActivityController c;

  @override
  Widget build(BuildContext context) {
    return Obx(() => RefreshIndicator(
      color: AppColors.primary,
      onRefresh: c.load,
      child: c.myDonations.isEmpty
          ? ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                SizedBox(
                  height: 320,
                  child: EmptyView(
                      icon: Icons.volunteer_activism_outlined, title: 'no_my_donations'.tr),
                ),
              ],
            )
          : ListView.builder(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(20),
              itemCount: c.myDonations.length,
              itemBuilder: (context, i) => _donationCard(c.myDonations[i]),
            ),
    ));
  }

  Widget _donationCard(Donation d) {
    final r = d.bloodRequest;
    return AppCard(
      margin: const EdgeInsets.only(bottom: 12),
      onTap: () => Get.to(() => RequestDetailScreen(requestId: d.bloodRequestId)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (r != null) ...[BloodChip(r.bloodType, size: 46), const SizedBox(width: 12)],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(r?.patientName ?? '',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    if (r != null)
                      Text('${r.hospitalName} · ${r.city}',
                          style: const TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
              StatusBadge(d.status, donation: true),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${'units_offered'.trParams({'n': '${d.unitsOffered}'})} · ${formatDate(d.createdAt)}',
            style: const TextStyle(color: Colors.grey, fontSize: 12),
          ),
          if (d.status == 'PENDING') ...[
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () async {
                  if (await confirmDialog('cancel_pledge'.tr, 'cancel_pledge_q'.tr)) {
                    await c.cancelPledge(d.id);
                  }
                },
                child: Text('cancel_pledge'.tr),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
