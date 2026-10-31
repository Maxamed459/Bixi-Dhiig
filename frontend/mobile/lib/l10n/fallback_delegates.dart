import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

/// Flutter ships Material/Cupertino/Widgets strings for English but not Somali.
/// With an unsupported locale (e.g. 'so') widgets such as TextField would throw
/// "No MaterialLocalizations found". These delegates accept any locale and load
/// the English framework strings; the app's own text comes from GetX translations.
class _FallbackDelegate<T> extends LocalizationsDelegate<T> {
  const _FallbackDelegate(this.inner);

  final LocalizationsDelegate<T> inner;

  @override
  bool isSupported(Locale locale) => true;

  @override
  Future<T> load(Locale locale) => inner.load(const Locale('en'));

  @override
  bool shouldReload(covariant LocalizationsDelegate<T> old) => false;
}

const List<LocalizationsDelegate<dynamic>> appLocalizationDelegates = [
  _FallbackDelegate<MaterialLocalizations>(DefaultMaterialLocalizations.delegate),
  _FallbackDelegate<WidgetsLocalizations>(DefaultWidgetsLocalizations.delegate),
  _FallbackDelegate<CupertinoLocalizations>(DefaultCupertinoLocalizations.delegate),
];
