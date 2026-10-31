import 'package:get/get.dart';

import '../core/api_client.dart';
import '../core/utils.dart';
import '../models/blood_request.dart';
import 'activity_controller.dart';
import 'requests_controller.dart';

class RequestDetailController extends GetxController {
  RequestDetailController(this.id);

  final String id;
  final ApiClient _api = ApiClient.instance;

  final Rxn<BloodRequest> request = Rxn<BloodRequest>();
  final RxBool loading = true.obs;
  final RxBool pledging = false.obs;
  final RxnString error = RxnString();

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<void> load() async {
    loading.value = true;
    error.value = null;
    final r = await _api.get('/blood-requests/$id');
    if (r.success && r.data is Map) {
      request.value = BloodRequest.fromJson(Map<String, dynamic>.from(r.data as Map));
    } else {
      error.value = r.displayMessage;
    }
    loading.value = false;
  }

  Future<void> pledge() async {
    pledging.value = true;
    final r = await _api.post('/donations', body: {'bloodRequestId': id, 'unitsOffered': 1});
    pledging.value = false;
    if (!r.success) {
      Toast.error(r.displayMessage);
      return;
    }
    Toast.success('pledge_sent'.tr);
    if (Get.isRegistered<ActivityController>()) Get.find<ActivityController>().load();
    await load();
  }

  Future<void> cancelRequest() async {
    final r = await _api.patch('/blood-requests/$id/cancel');
    if (!r.success) {
      Toast.error(r.displayMessage);
      return;
    }
    Toast.success('request_cancelled'.tr);
    if (Get.isRegistered<ActivityController>()) Get.find<ActivityController>().load();
    if (Get.isRegistered<RequestsController>()) Get.find<RequestsController>().load();
    await load();
  }
}
