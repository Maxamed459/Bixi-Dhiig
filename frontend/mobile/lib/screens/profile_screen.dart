import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/auth_controller.dart';
import '../controllers/theme_controller.dart';
import '../core/theme.dart';
import '../core/utils.dart';
import '../widgets/app_button.dart';
import '../widgets/app_card.dart';
import '../widgets/app_text_field.dart';
import '../widgets/blood_type_dropdown.dart';
import '../widgets/language_switcher.dart';
import 'change_password_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final AuthController auth = Get.find<AuthController>();
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _phone;
  late final TextEditingController _city;
  String? _blood;
  bool _alerts = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final u = auth.user.value;
    _name = TextEditingController(text: u?.displayName ?? '');
    _phone = TextEditingController(text: u?.phone ?? '');
    _city = TextEditingController(text: u?.city ?? '');
    _blood = u?.bloodType;
    _alerts = u?.receiveAlerts ?? true;
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _city.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_formKey.currentState?.validate() != true) return;
    setState(() => _saving = true);
    final body = <String, dynamic>{
      'display_name': _name.text.trim(),
      'phone': _phone.text.trim(),
      'city': _city.text.trim(),
      'receiveAlerts': _alerts,
    };
    if (_blood != null) body['bloodType'] = _blood;
    final ok = await auth.updateProfile(body);
    if (!mounted) return;
    setState(() => _saving = false);
    if (ok) Toast.success('saved'.tr);
  }

  @override
  Widget build(BuildContext context) {
    final u = auth.user.value;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('profile_title'.tr,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
        const SizedBox(height: 16),
        Row(
          children: [
            CircleAvatar(
              radius: 30,
              backgroundColor: AppColors.primary,
              child: Text(initials(u?.displayName ?? ''),
                  style: const TextStyle(
                      color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(u?.displayName ?? '',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  Text(u?.email ?? '', style: const TextStyle(color: Colors.grey)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        AppCard(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AppTextField(
                  controller: _name,
                  label: 'full_name'.tr,
                  icon: Icons.person_outline,
                  validator: (v) => (v ?? '').trim().length < 2 ? 'required'.tr : null,
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _phone,
                  label: 'phone'.tr,
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: (v) => phoneRegex.hasMatch((v ?? '').trim()) ? null : 'invalid_phone'.tr,
                ),
                const SizedBox(height: 14),
                BloodTypeDropdown(
                  label: 'blood_type'.tr,
                  initial: _blood,
                  onSelected: (v) => _blood = v,
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _city,
                  label: 'city'.tr,
                  icon: Icons.location_city_outlined,
                ),
                const SizedBox(height: 6),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  activeColor: AppColors.primary,
                  title: Text('receive_alerts'.tr),
                  subtitle: Text('receive_alerts_sub'.tr),
                  value: _alerts,
                  onChanged: (v) => setState(() => _alerts = v),
                ),
                const SizedBox(height: 10),
                AppButton(label: 'save'.tr, loading: _saving, onPressed: _save),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('language'.tr, style: const TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              const SizedBox(width: double.infinity, child: LanguageSwitcher()),
            ],
          ),
        ),
        const SizedBox(height: 16),
        AppCard(
          child: Obx(() {
            final themes = Get.find<ThemeController>();
            return DropdownButtonFormField<String>(
              value: themes.mode.value,
              decoration: InputDecoration(
                labelText: 'theme'.tr,
                prefixIcon: const Icon(Icons.palette_outlined),
                border: InputBorder.none,
              ),
              items: [
                DropdownMenuItem(value: 'system', child: Text('theme_system'.tr)),
                DropdownMenuItem(value: 'light', child: Text('theme_light'.tr)),
                DropdownMenuItem(value: 'dark', child: Text('theme_dark'.tr)),
              ],
              onChanged: (value) {
                if (value != null) themes.change(value);
              },
            );
          }),
        ),
        const SizedBox(height: 16),
        AppButton(
          label: 'change_password'.tr,
          outlined: true,
          icon: Icons.lock_outline,
          onPressed: () => Get.to(() => const ChangePasswordScreen()),
        ),
        const SizedBox(height: 10),
        AppButton(
          label: 'logout'.tr,
          outlined: true,
          icon: Icons.logout,
          onPressed: () async {
            if (await confirmDialog('logout'.tr, 'logout_q'.tr)) await auth.logout();
          },
        ),
        const SizedBox(height: 10),
        AppButton(
          label: 'delete_account'.tr,
          danger: true,
          icon: Icons.delete_outline,
          onPressed: () async {
            if (await confirmDialog('delete_account'.tr, 'delete_account_q'.tr)) {
              await auth.deleteAccount();
            }
          },
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}
