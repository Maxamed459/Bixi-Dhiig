import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/theme.dart';

class AppTextField extends StatefulWidget {
  const AppTextField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.helper,
    this.icon,
    this.keyboardType,
    this.obscure = false,
    this.validator,
    this.maxLines = 1,
    this.maxLength,
    this.inputFormatters,
    this.textAlign = TextAlign.start,
    this.textInputAction,
  });

  final TextEditingController controller;
  final String label;
  final String? hint;
  final String? helper;
  final IconData? icon;
  final TextInputType? keyboardType;
  final bool obscure;
  final String? Function(String?)? validator;
  final int maxLines;
  final int? maxLength;
  final List<TextInputFormatter>? inputFormatters;
  final TextAlign textAlign;
  final TextInputAction? textInputAction;

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  late bool _hidden = widget.obscure;

  @override
  Widget build(BuildContext context) {
    final dark = isDark(context);
    final fill = dark ? AppColors.darkCard : Colors.white;
    OutlineInputBorder border(Color color) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: color),
        );

    return TextFormField(
      controller: widget.controller,
      keyboardType: widget.keyboardType,
      obscureText: _hidden,
      validator: widget.validator,
      maxLines: widget.obscure ? 1 : widget.maxLines,
      maxLength: widget.maxLength,
      inputFormatters: widget.inputFormatters,
      textAlign: widget.textAlign,
      textInputAction: widget.textInputAction,
      decoration: InputDecoration(
        labelText: widget.label,
        hintText: widget.hint,
        helperText: widget.helper,
        helperMaxLines: 2,
        counterText: '',
        filled: true,
        fillColor: fill,
        prefixIcon: widget.icon == null ? null : Icon(widget.icon, size: 20),
        suffixIcon: widget.obscure
            ? IconButton(
                icon: Icon(_hidden ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                    size: 20),
                onPressed: () => setState(() => _hidden = !_hidden),
              )
            : null,
        border: border(Colors.transparent),
        enabledBorder: border(dark ? Colors.white12 : Colors.black12),
        focusedBorder: border(AppColors.primary),
        errorBorder: border(AppColors.primary),
        focusedErrorBorder: border(AppColors.primary),
      ),
    );
  }
}
