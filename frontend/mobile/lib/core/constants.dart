class AppConstants {
  /// Backend base URL.
  /// - Android emulator: http://10.0.2.2:4000/api/v1 (10.0.2.2 = your computer)
  /// - iOS simulator:    http://localhost:4000/api/v1
  /// - Real phone:       http://<your-computer-LAN-ip>:4000/api/v1 or your deployed URL
  // static const String apiBaseUrl = 'http://localhost:4000/api/v1'; // web
  static const String apiBaseUrl = 'http://192.168.0.112:4000/api/v1';

  /// The *web* OAuth client ID from Google Cloud Console (same project as the
  /// backend's GOOGLE_CLIENT_ID). The backend verifies the idToken against it.
  static const String googleServerClientId =
      'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';

  /// Pass the real value with --dart-define=ONESIGNAL_APP_ID=... during builds.
  static const String oneSignalAppId = String.fromEnvironment(
    'ONESIGNAL_APP_ID',
    defaultValue: '7a5ebc64-d880-4cf5-b3fd-3d88a4d09a8e',
  );

  static const String prefLang = 'lang';
  static const String prefTheme = 'theme';

  static const List<String> bloodTypes = [
    'A_POSITIVE',
    'A_NEGATIVE',
    'B_POSITIVE',
    'B_NEGATIVE',
    'AB_POSITIVE',
    'AB_NEGATIVE',
    'O_POSITIVE',
    'O_NEGATIVE',
  ];

  static const List<String> urgencies = ['NORMAL', 'URGENT', 'CRITICAL'];
}
