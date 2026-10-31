import 'package:flutter/material.dart';

import '../core/constants.dart';
import '../core/utils.dart';

/// Material 3 dropdown for blood types. Validation is done by the screen.
class BloodTypeDropdown extends StatelessWidget {
  const BloodTypeDropdown({
    super.key,
    required this.label,
    required this.onSelected,
    this.initial,
    this.helper,
    this.errorText,
  });

  final String label;
  final String? initial;
  final String? helper;
  final String? errorText;
  final ValueChanged<String?> onSelected;

  @override
  Widget build(BuildContext context) {
    return DropdownMenu<String>(
      expandedInsets: EdgeInsets.zero,
      label: Text(label),
      helperText: helper,
      errorText: errorText,
      initialSelection: initial,
      menuHeight: 280,
      leadingIcon: const Icon(Icons.water_drop_outlined, size: 20),
      onSelected: onSelected,
      dropdownMenuEntries: [
        for (final t in AppConstants.bloodTypes) DropdownMenuEntry<String>(value: t, label: bloodLabel(t)),
      ],
    );
  }
}
