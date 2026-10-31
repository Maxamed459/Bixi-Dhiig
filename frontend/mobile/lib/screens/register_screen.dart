import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/auth_controller.dart';
import '../core/utils.dart';
import '../widgets/app_button.dart';
import '../widgets/app_text_field.dart';
import '../widgets/blood_type_dropdown.dart';
import '../widgets/language_switcher.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _city = TextEditingController();
  final _password = TextEditingController();
  final AuthController auth = Get.find<AuthController>();

  String? _bloodType;
  String? _bloodError;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    _city.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final valid = _formKey.currentState?.validate() == true;
    setState(() => _bloodError = _bloodType == null ? 'required'.tr : null);
    if (!valid || _bloodType == null) return;

    await auth.register(
      name: _name.text,
      email: _email.text,
      password: _password.text,
      phone: _phone.text,
      bloodType: _bloodType!,
      city: _city.text,
    );
  }

  String? _required(String? v) => (v ?? '').trim().isEmpty ? 'required'.tr : null;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(actions: const [LanguageSwitcher(), SizedBox(width: 16)]),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('create_account'.tr,
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
                const SizedBox(height: 6),
                Text('register_subtitle'.tr, style: const TextStyle(color: Colors.grey)),
                const SizedBox(height: 24),
                AppTextField(
                  controller: _name,
                  label: 'full_name'.tr,
                  icon: Icons.person_outline,
                  textInputAction: TextInputAction.next,
                  validator: (v) => (v ?? '').trim().length < 2 ? 'required'.tr : null,
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _email,
                  label: 'email'.tr,
                  icon: Icons.mail_outline,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  validator: (v) =>
                      emailRegex.hasMatch((v ?? '').trim()) ? null : 'invalid_email'.tr,
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _phone,
                  label: 'phone'.tr,
                  hint: 'phone_hint'.tr,
                  helper: 'phone_help'.tr,
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  textInputAction: TextInputAction.next,
                  validator: (v) => phoneRegex.hasMatch((v ?? '').replaceAll(RegExp(r'[\s-]'), ''))
                      ? null
                      : 'invalid_phone'.tr,
                ),
                const SizedBox(height: 14),
                BloodTypeDropdown(
                  label: 'blood_type'.tr,
                  helper: 'blood_type_help'.tr,
                  errorText: _bloodError,
                  onSelected: (v) => setState(() {
                    _bloodType = v;
                    _bloodError = null;
                  }),
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
                  controller: _password,
                  label: 'password'.tr,
                  icon: Icons.lock_outline,
                  obscure: true,
                  validator: (v) => (v ?? '').length < 8 ? 'password_min'.tr : null,
                ),
                const SizedBox(height: 24),
                Obx(() => AppButton(
                      label: 'create_account'.tr,
                      loading: auth.busy.value,
                      onPressed: _submit,
                    )),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Flexible(child: Text('have_account'.tr, style: const TextStyle(color: Colors.grey))),
                    TextButton(
                      onPressed: () => Get.back(),
                      child: Text('sign_in'.tr, style: const TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
