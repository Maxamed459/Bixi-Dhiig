import 'json_utils.dart';

class BloodRequest {
  final String id;
  final String requesterId;
  final String requesterName;
  final String? requesterPhone;
  final String patientName;
  final String bloodType;
  final int unitsNeeded;
  final int unitsFulfilled;
  final String urgency;
  final String hospitalName;
  final String city;
  final String? address;
  final String contactPhone;
  final String? notes;
  final String status;
  final String? rejectionReason;
  final int donationsCount;
  final DateTime? createdAt;

  const BloodRequest({
    required this.id,
    required this.requesterId,
    this.requesterName = '',
    this.requesterPhone,
    required this.patientName,
    required this.bloodType,
    required this.unitsNeeded,
    required this.unitsFulfilled,
    required this.urgency,
    required this.hospitalName,
    required this.city,
    this.address,
    required this.contactPhone,
    this.notes,
    required this.status,
    this.rejectionReason,
    this.donationsCount = 0,
    this.createdAt,
  });

  double get progress =>
      unitsNeeded <= 0 ? 0 : (unitsFulfilled / unitsNeeded).clamp(0.0, 1.0).toDouble();

  factory BloodRequest.fromJson(Map<String, dynamic> j) {
    final requester = asMap(j['requester']);
    final count = asMap(j['_count']);
    return BloodRequest(
      id: asStr(j['id']) ?? '',
      requesterId: asStr(j['requesterId']) ?? '',
      requesterName: asStr(requester?['display_name']) ?? '',
      requesterPhone: asStr(requester?['phone']),
      patientName: asStr(j['patientName']) ?? '',
      bloodType: asStr(j['bloodType']) ?? '',
      unitsNeeded: asInt(j['unitsNeeded'], 1),
      unitsFulfilled: asInt(j['unitsFulfilled']),
      urgency: asStr(j['urgency']) ?? 'NORMAL',
      hospitalName: asStr(j['hospitalName']) ?? '',
      city: asStr(j['city']) ?? '',
      address: asStr(j['address']),
      contactPhone: asStr(j['contactPhone']) ?? '',
      notes: asStr(j['notes']),
      status: asStr(j['status']) ?? 'PENDING',
      rejectionReason: asStr(j['rejectionReason']),
      donationsCount: asInt(count?['donations']),
      createdAt: asDate(j['createdAt']),
    );
  }
}
