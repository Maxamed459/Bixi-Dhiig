import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/auth_controller.dart';
import '../widgets/app_button.dart';
import '../widgets/app_text_field.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _confirm = TextEditingController();
  final AuthController auth = Get.find<AuthController>();
  bool _busy = false;

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_formKey.currentState?.validate() != true) return;
    setState(() => _busy = true);
    final ok = await auth.changePassword(_current.text, _next.text);
    if (!mounted) return;
    setState(() => _busy = false);
    if (ok) Get.back();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('change_password'.tr)),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AppTextField(
                  controller: _current,
                  label: 'current_password'.tr,
                  icon: Icons.lock_outline,
                  obscure: true,
                  validator: (v) => (v ?? '').isEmpty ? 'required'.tr : null,
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _next,
                  label: 'new_password'.tr,
                  icon: Icons.lock_reset_outlined,
                  obscure: true,
                  validator: (v) => (v ?? '').length < 8 ? 'password_min'.tr : null,
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: _confirm,
                  label: 'confirm_password'.tr,
                  icon: Icons.lock_reset_outlined,
                  obscure: true,
                  validator: (v) => v == _next.text ? null : 'password_mismatch'.tr,
                ),
                const SizedBox(height: 24),
                AppButton(label: 'save'.tr, loading: _busy, onPressed: _submit),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
