import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/donors_controller.dart';
import '../core/theme.dart';
import '../models/blood_request.dart';
import '../models/donation.dart';
import '../widgets/app_card.dart';
import '../widgets/badges.dart';
import '../widgets/state_views.dart';

/// Requester view: who offered to donate, with accept / decline / completed actions.
class RequestDonorsScreen extends StatefulWidget {
  const RequestDonorsScreen({super.key, required this.request});

  final BloodRequest request;

  @override
  State<RequestDonorsScreen> createState() => _RequestDonorsScreenState();
}

class _RequestDonorsScreenState extends State<RequestDonorsScreen> {
  late final DonorsController c;

  @override
  void initState() {
    super.initState();
    c = Get.put(DonorsController(widget.request.id), tag: widget.request.id);
  }

  @override
  void dispose() {
    Get.delete<DonorsController>(tag: widget.request.id, force: true);
    super.dispose();
  }

  Widget _actions(Donation d) {
    final busy = c.busyId.value == d.id;
    if (busy) {
      return const Padding(
        padding: EdgeInsets.only(top: 12),
        child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }
    if (d.status == 'PENDING') {
      return Padding(
        padding: const EdgeInsets.only(top: 12),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => c.setStatus(d.id, 'DECLINED'),
                child: Text('decline'.tr),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: FilledButton(
                style: FilledButton.styleFrom(backgroundColor: AppColors.primary),
                onPressed: () => c.setStatus(d.id, 'ACCEPTED'),
                child: Text('accept'.tr),
              ),
            ),
          ],
        ),
      );
    }
    if (d.status == 'ACCEPTED') {
      return Padding(
        padding: const EdgeInsets.only(top: 12),
        child: SizedBox(
          width: double.infinity,
          child: FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () => c.setStatus(d.id, 'COMPLETED'),
            child: Text('mark_completed'.tr),
          ),
        ),
      );
    }
    return const SizedBox.shrink();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('donors_title'.tr)),
      body: Obx(() {
        if (c.loading.value && c.donors.isEmpty) return const LoadingView();
        if (c.error.value != null && c.donors.isEmpty) {
          return ErrorView(message: c.error.value!, onRetry: c.load);
        }
        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: c.load,
          child: c.donors.isEmpty
              ? ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: [
                    SizedBox(
                      height: 320,
                      child: EmptyView(
                        icon: Icons.people_outline,
                        title: 'no_donors'.tr,
                      ),
                    ),
                  ],
                )
              : ListView.builder(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(20),
                  itemCount: c.donors.length,
                  itemBuilder: (context, i) {
                    final d = c.donors[i];
                    return AppCard(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(d.donorName,
                                    style: const TextStyle(
                                        fontSize: 16, fontWeight: FontWeight.w700)),
                              ),
                              StatusBadge(d.status, donation: true),
                            ],
                          ),
                          if (d.donorPhone != null) ...[
                            const SizedBox(height: 4),
                            Text(d.donorPhone!, style: const TextStyle(color: Colors.grey)),
                          ],
                          const SizedBox(height: 4),
                          Text('units_offered'.trParams({'n': '${d.unitsOffered}'}),
                              style: const TextStyle(color: Colors.grey, fontSize: 12)),
                          _actions(d),
                        ],
                      ),
                    );
                  },
                ),
        );
      }),
    );
  }
}
