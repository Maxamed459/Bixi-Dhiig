import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../core/theme.dart';
import '../models/blood_request.dart';
import 'app_card.dart';
import 'badges.dart';

class RequestCard extends StatelessWidget {
  const RequestCard({super.key, required this.request, this.onTap, this.trailing});

  final BloodRequest request;
  final VoidCallback? onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      margin: const EdgeInsets.only(bottom: 12),
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              BloodChip(request.bloodType),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      request.patientName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${request.hospitalName} · ${request.city}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              trailing ?? UrgencyBadge(request.urgency),
            ],
          ),
          const SizedBox(height: 14),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: request.progress,
              minHeight: 6,
              color: AppColors.primary,
              backgroundColor: AppColors.primary.withValues(alpha: 0.12),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'units_progress'.trParams({
              'done': '${request.unitsFulfilled}',
              'total': '${request.unitsNeeded}',
            }),
            style: const TextStyle(fontSize: 12, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}
