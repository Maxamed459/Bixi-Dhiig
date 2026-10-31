import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/auth_controller.dart';
import '../core/theme.dart';
import '../core/utils.dart';
import '../widgets/app_button.dart';
import '../widgets/app_text_field.dart';
import '../widgets/language_switcher.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final AuthController auth = Get.find<AuthController>();

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState?.validate() != true) return;
    auth.login(_email.text, _password.text);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Align(alignment: Alignment.centerRight, child: LanguageSwitcher()),
                    const SizedBox(height: 24),
                    Center(
                      child: Container(
                        width: 68,
                        height: 68,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.primary, AppColors.primaryDark],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(22),
                        ),
                        child: const Icon(Icons.water_drop, color: Colors.white, size: 36),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text('welcome_back'.tr,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 6),
                    Text('login_subtitle'.tr,
                        textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
                    const SizedBox(height: 28),
                    Obx(() => AppButton(
                          label: 'continue_google'.tr,
                          icon: Icons.g_mobiledata,
                          outlined: true,
                          loading: false,
                          onPressed: auth.busy.value ? null : auth.googleSignIn,
                        )),
                    const SizedBox(height: 20),
                    Row(children: [
                      const Expanded(child: Divider()),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text('or'.tr, style: const TextStyle(color: Colors.grey)),
                      ),
                      const Expanded(child: Divider()),
                    ]),
                    const SizedBox(height: 20),
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
                      controller: _password,
                      label: 'password'.tr,
                      icon: Icons.lock_outline,
                      obscure: true,
                      validator: (v) => (v ?? '').isEmpty ? 'required'.tr : null,
                    ),
                    const SizedBox(height: 22),
                    Obx(() => AppButton(
                          label: 'sign_in'.tr,
                          loading: auth.busy.value,
                          onPressed: _submit,
                        )),
                    const SizedBox(height: 18),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Flexible(child: Text('no_account'.tr, style: const TextStyle(color: Colors.grey))),
                        TextButton(
                          onPressed: () => Get.to(() => const RegisterScreen()),
                          child: Text('create_account'.tr,
                              style: const TextStyle(fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
