import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/auth_controller.dart';
import '../controllers/requests_controller.dart';
import '../controllers/nav_controller.dart';
import '../core/constants.dart';
import '../core/theme.dart';
import '../core/utils.dart';
import '../widgets/app_button.dart';
import '../widgets/app_text_field.dart';
import '../widgets/blood_type_dropdown.dart';

class CreateRequestScreen extends StatefulWidget {
  const CreateRequestScreen({super.key});

  @override
  State<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _patient = TextEditingController();
  final _hospital = TextEditingController();
  final _city = TextEditingController();
  final _address = TextEditingController();
  final _phone = TextEditingController();
  final _notes = TextEditingController();

  final RequestsController requests = Get.find<RequestsController>();

  String? _bloodType;
  String? _bloodError;
  String _urgency = 'NORMAL';
  int _units = 1;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    final user = Get.find<AuthController>().user.value;
    _city.text = user?.city ?? '';
    _phone.text = user?.phone ?? '';
  }

  @override
  void dispose() {
    _patient.dispose();
    _hospital.dispose();
    _city.dispose();
    _address.dispose();
    _phone.dispose();
    _notes.dispose();
    super.dispose();
  }

  String? _required(String? v) => (v ?? '').trim().isEmpty ? 'required'.tr : null;

  Future<void> _submit() async {
    final valid = _formKey.currentState?.validate() == true;
    setState(() => _bloodError = _bloodType == null ? 'required'.tr : null);
    if (!valid || _bloodType == null) return;

    setState(() => _submitting = true);
    if (await requests.hasActiveRequest()) {
      if (!mounted) return;
      setState(() => _submitting = false);
      Toast.error('active_request_exists'.tr);
      return;
    }
    final body = <String, dynamic>{
      'patientName': _patient.text.trim(),
      'bloodType': _bloodType,
      'unitsNeeded': _units,
      'urgency': _urgency,
      'hospitalName': _hospital.text.trim(),
      'city': _city.text.trim(),
      'contactPhone': _phone.text.replaceAll(RegExp(r'[\s-]'), ''),
    };
    if (_address.text.trim().isNotEmpty) body['address'] = _address.text.trim();
    if (_notes.text.trim().isNotEmpty) body['notes'] = _notes.text.trim();

    final ok = await requests.create(body);
    if (!mounted) return;
    setState(() => _submitting = false);
    if (ok) {
      Get.back();
      Get.find<NavController>().index.value = 1;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isUser = Get.find<AuthController>().user.value?.role == 'USER';
    return Scaffold(
      appBar: AppBar(title: Text('create_request'.tr)),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (isUser)
                  Container(
                    padding: const EdgeInsets.all(14),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: AppColors.urgent.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.info_outline, color: AppColors.urgent, size: 20),
                        const SizedBox(width: 10),
                        Expanded(child: Text('approval_note'.tr)),
                      ],
                    ),
                  ),
                AppTextField(
                  controller: _patient,
                  label: 'patient_name'.tr,
                  icon: Icons.person_outline,
                  textInputAction: TextInputAction.next,
                  validator: (v) => (v ?? '').trim().length < 2 ? 'required'.tr : null,
                ),
                const SizedBox(height: 14),
                BloodTypeDropdown(
                  label: 'blood_type'.tr,
                  errorText: _bloodError,
                  onSelected: (v) => setState(() {
                    _bloodType = v;
                    _bloodError = null;
                  }),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: Text('units_needed'.tr,
                          style: const TextStyle(fontWeight: FontWeight.w600)),
                    ),
                    IconButton.outlined(
                      onPressed: _units > 1 ? () => setState(() => _units--) : null,
                      icon: const Icon(Icons.remove),
                    ),
                    SizedBox(
                      width: 40,
                      child: Text('$_units',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                    ),
                    IconButton.outlined(
                      onPressed: _units < 20 ? () => setState(() => _units++) : null,
                      icon: const Icon(Icons.add),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text('urgency'.tr, style: const TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: [
                    for (final u in AppConstants.urgencies)
                      ChoiceChip(
                        label: Text('urgency_$u'.tr),
                        selected: _urgency == u,
                        selectedColor: urgencyColor(u),
                        showCheckmark: false,
                        labelStyle: TextStyle(
                          color: _urgency == u ? Colors.white : null,
                          fontWeight: FontWeight.w600,
                        ),
                        onSelected: (_) => setState(() => _urgency = u),
                      ),
                  ],
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _hospital,
                  label: 'hospital_name'.tr,
                  icon: Icons.local_hospital_outlined,
                  textInputAction: TextInputAction.next,
                  validator: (v) => (v ?? '').trim().length < 2 ? 'required'.tr : null,
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _city,
                  label: 'city'.tr,
                  icon: Icons.location_city_outlined,
                  textInputAction: TextInputAction.next,
                  validator: _required,
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _address,
                  label: 'address'.tr,
                  icon: Icons.place_outlined,
                  textInputAction: TextInputAction.next,
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _phone,
                  label: 'contact_phone'.tr,
                  hint: 'phone_hint'.tr,
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  textInputAction: TextInputAction.next,
                  validator: (v) => phoneRegex.hasMatch((v ?? '').replaceAll(RegExp(r'[\s-]'), ''))
                      ? null
                      : 'invalid_phone'.tr,
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _notes,
                  label: 'notes'.tr,
                  icon: Icons.notes_outlined,
                  maxLines: 3,
                ),
                const SizedBox(height: 24),
                AppButton(
                  label: 'submit_request'.tr,
                  loading: _submitting,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
