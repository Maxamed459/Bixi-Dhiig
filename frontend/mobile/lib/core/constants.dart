class AppConstants {
  /// Backend base URL.
  /// - Android emulator: http://10.0.2.2:4000/api/v1 (10.0.2.2 = your computer)
  /// - iOS simulator:    http://localhost:4000/api/v1
  /// - Real phone:       http://<your-computer-LAN-ip>:4000/api/v1 or your deployed URL
  // static const String apiBaseUrl = 'http://localhost:4000/api/v1'; // web
  static const String apiBaseUrl = 'http://192.168.0.105:4000/api/v1';

  /// The *web* OAuth client ID from Google Cloud Console (same project as the
  /// backend's GOOGLE_CLIENT_ID). The backend verifies the idToken against it.
  static const String googleServerClientId =
      'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';

  static const String prefLang = 'lang';

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
