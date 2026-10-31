# Bixi-Dhiig mobile (Flutter)

Donor / requester app for the Bixi-Dhiig blood-donation platform. English + Somali (EN/SOM).
State, navigation and i18n use GetX.

## Setup
1. `flutter pub get`
2. Set the API URL in `lib/core/constants.dart` (`apiBaseUrl`):
   - Android emulator: `http://10.0.2.2:4000/api/v1` (default)
   - Real device: `http://<your-LAN-IP>:4000/api/v1`
3. Google Sign-In: put your **web** OAuth client ID in `googleServerClientId`
   (same value as the backend `GOOGLE_CLIENT_ID`), and register the Android
   SHA-1 / iOS client in Google Cloud.
4. `flutter run`

The backend treats requests without `X-Client-Type: web` as mobile, so the
refresh token comes back in the JSON body and is kept in secure storage.
The app expects `GET/PATCH /users/me` on the backend.

## Add a language
1. Add a map in `lib/l10n/translations.dart` and register it in `keys`.
2. Add `{'code': 'xx', 'name': 'Name'}` to `AppTranslations.supported`.
Framework (Material) strings fall back to English for unsupported locales
(see `lib/l10n/fallback_delegates.dart`).
