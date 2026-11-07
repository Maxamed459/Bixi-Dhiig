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

## Push notifications
1. Create a OneSignal app and configure Android/iOS platform credentials in
   the OneSignal dashboard. Android still requires Firebase credentials inside
   OneSignal, but the app sends through OneSignal.
2. Add the OneSignal App ID at build time:
   `flutter run --dart-define=ONESIGNAL_APP_ID=your-onesignal-app-id`.
3. Place `google-services.json` in `android/app/` and keep the Google Services
   Gradle plugin enabled. For iOS, enable Push Notifications and Remote
   Notifications capabilities in Xcode.
4. Add `ONESIGNAL_APP_ID` and `ONESIGNAL_API_KEY` to the backend `.env`.
5. Apply the existing database migrations with `npx prisma migrate deploy`
   from `backend/`, then restart the backend.

Push notifications and the database-backed in-app notification center are
both enabled. The mobile user ID is registered as OneSignal `external_id`,
and tapping a request notification opens its request detail screen.

The backend treats requests without `X-Client-Type: web` as mobile, so the
refresh token comes back in the JSON body and is kept in secure storage.
The app expects `GET/PATCH /users/me` on the backend.

## Add a language
1. Add a map in `lib/l10n/translations.dart` and register it in `keys`.
2. Add `{'code': 'xx', 'name': 'Name'}` to `AppTranslations.supported`.
Framework (Material) strings fall back to English for unsupported locales
(see `lib/l10n/fallback_delegates.dart`).
