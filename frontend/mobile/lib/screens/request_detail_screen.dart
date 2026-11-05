import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

import '../controllers/auth_controller.dart';
import '../controllers/request_detail_controller.dart';
import '../core/theme.dart';
import '../core/utils.dart';
import '../models/blood_request.dart';
import '../widgets/app_button.dart';
import '../widgets/app_card.dart';
import '../widgets/badges.dart';
import '../widgets/state_views.dart';
import 'request_donors_screen.dart';

class RequestDetailScreen extends StatefulWidget {
  const RequestDetailScreen({super.key, required this.requestId});

  final String requestId;

  @override
  State<RequestDetailScreen> createState() => _RequestDetailScreenState();
}

class _RequestDetailScreenState extends State<RequestDetailScreen> {
  late final RequestDetailController c;

  @override
  void initState() {
    super.initState();
    c = Get.put(RequestDetailController(widget.requestId), tag: widget.requestId);
  }

  @override
  void dispose() {
    Get.delete<RequestDetailController>(tag: widget.requestId, force: true);
    super.dispose();
  }

  Widget _row(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.grey),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _body(BloodRequest r) {
    final me = Get.find<AuthController>().user.value;
    final isOwner = me != null && me.id == r.requesterId;
    final canPledge = me?.canDonate == true && !isOwner && r.status == 'APPROVED';
    final location = r.address == null ? r.city : '${r.address}, ${r.city}';

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  BloodChip(r.bloodType, size: 64),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(r.patientName,
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                        if (r.requesterName.isNotEmpty)
                          Text('requested_by'.trParams({'name': r.requesterName}),
                              style: const TextStyle(color: Colors.grey)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [UrgencyBadge(r.urgency), StatusBadge(r.status)],
              ),
              const SizedBox(height: 18),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: r.progress,
                  minHeight: 8,
                  color: AppColors.primary,
                  backgroundColor: AppColors.primary.withValues(alpha: 0.12),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'units_progress'.trParams({
                  'done': '${r.unitsFulfilled}',
                  'total': '${r.unitsNeeded}',
                }),
                style: const TextStyle(color: Colors.grey, fontSize: 12),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        AppCard(
          child: Column(
            children: [
              _row(Icons.local_hospital_outlined, 'hospital'.tr, r.hospitalName),
              _row(Icons.place_outlined, 'city'.tr, location),
              if (r.notes != null) _row(Icons.notes_outlined, 'notes'.tr, r.notes!),
              Row(
                children: [
                  Expanded(child: _row(Icons.phone_outlined, 'contact'.tr, r.contactPhone)),
                  IconButton(
                    tooltip: 'copy_number'.tr,
                    icon: const Icon(Icons.copy_outlined),
                    onPressed: () async {
                      await Clipboard.setData(ClipboardData(text: r.contactPhone));
                      Toast.success('number_copied'.tr);
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        if (canPledge)
          Obx(() => AppButton(
                label: 'i_can_donate'.tr,
                icon: Icons.volunteer_activism_outlined,
                loading: c.pledging.value,
                onPressed: c.pledge,
              )),
        if (isOwner) ...[
          Center(
            child: Text('your_request'.tr, style: const TextStyle(color: Colors.grey)),
          ),
          const SizedBox(height: 12),
          if (r.status == 'APPROVED' || r.status == 'FULFILLED')
            AppButton(
              label: 'view_donors'.tr,
              icon: Icons.people_outline,
              onPressed: () => Get.to(() => RequestDonorsScreen(request: r)),
            ),
          if (r.status == 'PENDING' || r.status == 'APPROVED') ...[
            const SizedBox(height: 12),
            AppButton(
              label: 'cancel_request'.tr,
              outlined: true,
              danger: true,
              onPressed: () async {
                if (await confirmDialog('cancel_request'.tr, 'cancel_request_q'.tr)) {
                  await c.cancelRequest();
                }
              },
            ),
          ],
        ],
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('request_details'.tr)),
      body: Obx(() {
        final r = c.request.value;
        if (c.loading.value && r == null) return const LoadingView();
        if (r == null) {
          return ErrorView(message: c.error.value ?? 'error_generic'.tr, onRetry: c.load);
        }
        return _body(r);
      }),
    );
  }
}
