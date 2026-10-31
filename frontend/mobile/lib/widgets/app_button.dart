import 'package:flutter/material.dart';

import '../core/theme.dart';

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.loading = false,
    this.outlined = false,
    this.icon,
    this.danger = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final bool outlined;
  final bool danger;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final shape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(16));
    final VoidCallback? action = loading ? null : onPressed;

    final Widget content = loading
        ? const SizedBox(
            height: 22,
            width: 22,
            child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[Icon(icon, size: 20), const SizedBox(width: 8)],
              Flexible(
                child: Text(
                  label,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          );

    if (outlined) {
      final color = danger ? AppColors.primary : null;
      return OutlinedButton(
        onPressed: action,
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(54),
          shape: shape,
          foregroundColor: color,
          side: color == null ? null : BorderSide(color: color),
        ),
        child: content,
      );
    }

    return FilledButton(
      onPressed: action,
      style: FilledButton.styleFrom(
        minimumSize: const Size.fromHeight(54),
        shape: shape,
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      child: content,
    );
  }
}
