import 'dart:ui' show Locale;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _localeKey = 'app_locale';

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(const Locale('zh')) {
    _loadSaved();
  }

  Future<void> _loadSaved() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString(_localeKey);
    if (code != null && (code == 'en' || code == 'zh')) {
      state = Locale(code);
    }
  }

  /// Switches between Chinese and English and persists [SharedPreferences].
  Future<void> toggleLocale() async {
    final next = state.languageCode == 'zh'
        ? const Locale('en')
        : const Locale('zh');
    state = next;
    final prefs = await SharedPreferences.getInstance();
    final ok = await prefs.setString(_localeKey, next.languageCode);
    if (!ok) {
      throw StateError('Failed to persist locale to SharedPreferences');
    }
  }
}

final localeProvider =
    StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});
