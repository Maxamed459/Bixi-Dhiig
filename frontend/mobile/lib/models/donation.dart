import 'blood_request.dart';
import 'json_utils.dart';

class Donation {
  final String id;
  final String donorId;
  final String donorName;
  final String? donorPhone;
  final String bloodRequestId;
  final int unitsOffered;
  final String status;
  final DateTime? createdAt;
  final BloodRequest? bloodRequest;

  const Donation({
    required this.id,
    required this.donorId,
    this.donorName = '',
    this.donorPhone,
    required this.bloodRequestId,
    required this.unitsOffered,
    required this.status,
    this.createdAt,
    this.bloodRequest,
  });

  factory Donation.fromJson(Map<String, dynamic> j) {
    final donor = asMap(j['donor']);
    final request = asMap(j['bloodRequest']);
    return Donation(
      id: asStr(j['id']) ?? '',
      donorId: asStr(j['donorId']) ?? '',
      donorName: asStr(donor?['display_name']) ?? '',
      donorPhone: asStr(donor?['phone']),
      bloodRequestId: asStr(j['bloodRequestId']) ?? '',
      unitsOffered: asInt(j['unitsOffered'], 1),
      status: asStr(j['status']) ?? 'PENDING',
      createdAt: asDate(j['createdAt']),
      bloodRequest: request == null ? null : BloodRequest.fromJson(request),
    );
  }
}
