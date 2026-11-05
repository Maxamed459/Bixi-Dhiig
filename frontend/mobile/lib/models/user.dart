import 'json_utils.dart';

class AppUser {
  final String id;
  final String displayName;
  final String email;
  final String? phone;
  final String? avatar;
  final String role;
  final String? bloodType;
  final String? city;
  final bool receiveAlerts;
  final bool isEmailVerified;
  final bool canDonate;
  final bool canRequest;

  const AppUser({
    required this.id,
    required this.displayName,
    required this.email,
    this.phone,
    this.avatar,
    required this.role,
    this.bloodType,
    this.city,
    this.receiveAlerts = true,
    this.isEmailVerified = false,
    this.canDonate = true,
    this.canRequest = true,
  });

  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
        id: asStr(j['id']) ?? '',
        displayName: asStr(j['display_name']) ?? '',
        email: asStr(j['email']) ?? '',
        phone: asStr(j['phone']),
        avatar: asStr(j['avater']),
        role: asStr(j['role']) ?? 'USER',
        bloodType: asStr(j['bloodType']),
        city: asStr(j['city']),
        receiveAlerts: j['receiveAlerts'] != false,
        isEmailVerified: j['is_email_verified'] == true,
        canDonate: j['canDonate'] != false,
        canRequest: j['canRequest'] != false,
      );
}
