import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'theme.dart';

/// "A_POSITIVE" -> "A+", "O_NEGATIVE" -> "O-"
String bloodLabel(String? value) {
  if (value == null || value.isEmpty) return '—';
  return value.replaceAll('_POSITIVE', '+').replaceAll('_NEGATIVE', '-');
}

Color urgencyColor(String urgency) {
  switch (urgency) {
    case 'CRITICAL':
      return AppColors.critical;
    case 'URGENT':
      return AppColors.urgent;
    default:
      return AppColors.normal;
  }
}

Color statusColor(String status) {
  switch (status) {
    case 'APPROVED':
    case 'ACCEPTED':
      return AppColors.normal;
    case 'FULFILLED':
    case 'COMPLETED':
      return const Color(0xFF2B6CB0);
    case 'REJECTED':
    case 'DECLINED':
      return AppColors.critical;
    case 'CANCELLED':
      return Colors.grey;
    default:
      return AppColors.urgent; // PENDING
  }
}

String formatDate(DateTime? d) {
  if (d == null) return '';
  try {
    return DateFormat.yMMMd(Get.locale?.languageCode ?? 'en').format(d);
  } catch (_) {
    return DateFormat.yMMMd('en').format(d);
  }
}

String initials(String name) {
  final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
  if (parts.isEmpty) return '?';
  if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
  return (parts.first.substring(0, 1) + parts.last.substring(0, 1)).toUpperCase();
}

final RegExp phoneRegex = RegExp(r'^\+?[1-9]\d{7,14}$');
final RegExp emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

class Toast {
  static void success(String message) => _show(message, const Color(0xFF2E7D6B));
  static void error(String message) => _show(message, AppColors.primary);

  static void _show(String message, Color color) {
    Get.snackbar(
      '',
      message,
      titleText: const SizedBox.shrink(),
      snackPosition: SnackPosition.BOTTOM,
      margin: const EdgeInsets.all(16),
      borderRadius: 14,
      backgroundColor: color,
      colorText: Colors.white,
      duration: const Duration(seconds: 3),
    );
  }
}

Future<bool> confirmDialog(String title, String body) async {
  final result = await Get.dialog<bool>(
    AlertDialog(
      title: Text(title),
      content: Text(body),
      actions: [
        TextButton(onPressed: () => Get.back(result: false), child: Text('cancel'.tr)),
        TextButton(onPressed: () => Get.back(result: true), child: Text('confirm'.tr)),
      ],
    ),
  );
  return result ?? false;
}
