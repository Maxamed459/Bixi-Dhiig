import 'package:get/get.dart';

import '../core/api_client.dart';
import '../core/utils.dart';
import '../models/donation.dart';
import 'activity_controller.dart';
import 'requests_controller.dart';

/// Donors who responded to one of the user's requests (requester view).
class DonorsController extends GetxController {
  DonorsController(this.requestId);

  final String requestId;
  final ApiClient _api = ApiClient.instance;

  final RxList<Donation> donors = <Donation>[].obs;
  final RxBool loading = true.obs;
  final RxnString error = RxnString();
  final RxnString busyId = RxnString();

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<void> load() async {
    loading.value = true;
    error.value = null;
    final r = await _api.get('/donations/request/$requestId');
    if (r.success && r.data is List) {
      donors.assignAll((r.data as List)
          .whereType<Map>()
          .map((e) => Donation.fromJson(Map<String, dynamic>.from(e))));
    } else {
      error.value = r.displayMessage;
    }
    loading.value = false;
  }

  /// status: ACCEPTED | DECLINED | COMPLETED
  Future<void> setStatus(String donationId, String status) async {
    busyId.value = donationId;
    final r = await _api.patch('/donations/$donationId/status', body: {'status': status});
    busyId.value = null;
    if (!r.success) {
      Toast.error(r.displayMessage);
      return;
    }
    Toast.success('donation_updated'.tr);
    if (Get.isRegistered<ActivityController>()) Get.find<ActivityController>().load();
    if (Get.isRegistered<RequestsController>()) Get.find<RequestsController>().load();
    await load();
  }
}
