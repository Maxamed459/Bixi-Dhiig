import 'package:get/get.dart';

import '../core/api_client.dart';
import '../core/utils.dart';
import '../models/blood_request.dart';
import '../models/donation.dart';

/// "My requests" and "My donations" + the numbers shown on the Home hero card.
class ActivityController extends GetxController {
  final ApiClient _api = ApiClient.instance;

  final RxList<BloodRequest> myRequests = <BloodRequest>[].obs;
  final RxList<Donation> myDonations = <Donation>[].obs;
  final RxBool loading = false.obs;
  final RxnString error = RxnString();

  int get completedDonations => myDonations.where((d) => d.status == 'COMPLETED').length;

  int get unitsGiven => myDonations
      .where((d) => d.status == 'COMPLETED')
      .fold<int>(0, (sum, d) => sum + d.unitsOffered);

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<void> load() async {
    loading.value = true;
    error.value = null;
    final results = await Future.wait([
      _api.get('/blood-requests/mine'),
      _api.get('/donations/mine'),
    ]);
    final reqRes = results[0];
    final donRes = results[1];

    if (reqRes.success && reqRes.data is List) {
      myRequests.assignAll((reqRes.data as List)
          .whereType<Map>()
          .map((e) => BloodRequest.fromJson(Map<String, dynamic>.from(e))));
    } else if (!reqRes.success) {
      error.value = reqRes.displayMessage;
    }

    if (donRes.success && donRes.data is List) {
      myDonations.assignAll((donRes.data as List)
          .whereType<Map>()
          .map((e) => Donation.fromJson(Map<String, dynamic>.from(e))));
    } else if (!donRes.success) {
      error.value = donRes.displayMessage;
    }
    loading.value = false;
  }

  Future<void> cancelRequest(String id) async {
    final r = await _api.patch('/blood-requests/$id/cancel');
    if (!r.success) {
      Toast.error(r.displayMessage);
      return;
    }
    Toast.success('request_cancelled'.tr);
    await load();
  }

  Future<void> cancelPledge(String donationId) async {
    final r = await _api.patch('/donations/$donationId/status', body: {'status': 'CANCELLED'});
    if (!r.success) {
      Toast.error(r.displayMessage);
      return;
    }
    Toast.success('pledge_cancelled'.tr);
    await load();
  }
}
