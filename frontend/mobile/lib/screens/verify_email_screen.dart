import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

import '../controllers/auth_controller.dart';
import '../widgets/app_button.dart';
import '../widgets/app_text_field.dart';

class VerifyEmailScreen extends StatefulWidget {
  const VerifyEmailScreen({super.key});

  @override
  State<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends State<VerifyEmailScreen> {
  static const int _cooldownSeconds = 30;

  final _code = TextEditingController();
  final AuthController auth = Get.find<AuthController>();
  Timer? _timer;
  int _remaining = _cooldownSeconds;

  @override
  void initState() {
    super.initState();
    _startCooldown();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _code.dispose();
    super.dispose();
  }

  void _startCooldown() {
    _timer?.cancel();
    setState(() => _remaining = _cooldownSeconds);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() {
        if (_remaining > 0) _remaining--;
      });
      if (_remaining == 0) t.cancel();
    });
  }

  Future<void> _resend() async {
    await auth.resendCode();
    if (mounted) _startCooldown();
  }

  @override
  Widget build(BuildContext context) {
    final email = auth.user.value?.email ?? '';
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(Icons.mark_email_read_outlined, size: 64),
                  const SizedBox(height: 18),
                  Text('verify_title'.tr,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  Text('verify_sent'.trParams({'email': email}),
                      textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
                  const SizedBox(height: 28),
                  AppTextField(
                    controller: _code,
                    label: 'verification_code'.tr,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  ),
                  const SizedBox(height: 18),
                  Obx(() => AppButton(
                        label: 'verify'.tr,
                        loading: auth.busy.value,
                        onPressed: () {
                          if (_code.text.trim().length >= 4) auth.verify(_code.text);
                        },
                      )),
                  const SizedBox(height: 10),
                  TextButton(
                    onPressed: _remaining > 0 ? null : _resend,
                    child: Text(_remaining > 0
                        ? 'resend_in'.trParams({'s': '$_remaining'})
                        : 'resend_code'.tr),
                  ),
                  TextButton(
                    onPressed: auth.logout,
                    child: Text('use_other_account'.tr),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
