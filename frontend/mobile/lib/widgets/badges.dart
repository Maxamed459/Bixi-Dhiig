import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../core/theme.dart';
import '../core/utils.dart';

class BloodChip extends StatelessWidget {
  const BloodChip(this.bloodType, {super.key, this.size = 52});

  final String bloodType;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(size / 2.6),
      ),
      child: Text(
        bloodLabel(bloodType),
        style: TextStyle(
          color: AppColors.primary,
          fontWeight: FontWeight.w800,
          fontSize: size * 0.36,
        ),
      ),
    );
  }
}

class Pill extends StatelessWidget {
  const Pill({super.key, required this.text, required this.color});

  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700),
      ),
    );
  }
}

class UrgencyBadge extends StatelessWidget {
  const UrgencyBadge(this.urgency, {super.key});

  final String urgency;

  @override
  Widget build(BuildContext context) =>
      Pill(text: 'urgency_$urgency'.tr, color: urgencyColor(urgency));
}

class StatusBadge extends StatelessWidget {
  const StatusBadge(this.status, {super.key, this.donation = false});

  final String status;
  final bool donation;

  @override
  Widget build(BuildContext context) => Pill(
        text: (donation ? 'donation_$status' : 'status_$status').tr,
        color: statusColor(status),
      );
}
