import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Access + refresh tokens live in the platform keychain/keystore.
class TokenStorage {
  static const FlutterSecureStorage _s = FlutterSecureStorage();
  static const String _access = 'access_token';
  static const String _refresh = 'refresh_token';

  static Future<String?> readAccess() => _s.read(key: _access);
  static Future<String?> readRefresh() => _s.read(key: _refresh);

  static Future<void> save({required String access, String? refresh}) async {
    await _s.write(key: _access, value: access);
    if (refresh != null) {
      await _s.write(key: _refresh, value: refresh);
    }
  }

  static Future<void> clear() async {
    await _s.delete(key: _access);
    await _s.delete(key: _refresh);
  }
}
