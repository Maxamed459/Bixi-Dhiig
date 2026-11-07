import 'json_utils.dart';

class AppNotification {
  final String id;
  final String type;
  final String title;
  final String body;
  final String? requestId;
  final String? donationId;
  final DateTime createdAt;
  final DateTime? readAt;

  const AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    this.requestId,
    this.donationId,
    required this.createdAt,
    this.readAt,
  });

  bool get isRead => readAt != null;

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    final data = asMap(json['data']);
    return AppNotification(
      id: asStr(json['id']) ?? '',
      type: asStr(json['type']) ?? '',
      title: asStr(json['title']) ?? '',
      body: asStr(json['body']) ?? '',
      requestId: asStr(data?['requestId']),
      donationId: asStr(data?['donationId']),
      createdAt: DateTime.tryParse(asStr(json['createdAt']) ?? '') ?? DateTime.now(),
      readAt: DateTime.tryParse(asStr(json['readAt']) ?? ''),
    );
  }
}
