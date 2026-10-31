import 'package:get/get.dart';

import '../core/api_client.dart';
import '../core/utils.dart';
import '../models/blood_request.dart';
import '../models/json_utils.dart';

/// Open (approved) blood requests feed, with filters + pagination.
class RequestsController extends GetxController {
  final ApiClient _api = ApiClient.instance;

  final RxList<BloodRequest> items = <BloodRequest>[].obs;
  final RxBool loading = false.obs;
  final RxBool loadingMore = false.obs;
  final RxnString error = RxnString();
  final RxInt total = 0.obs;

  final RxnString bloodFilter = RxnString();
  final RxnString urgencyFilter = RxnString();

  int _page = 1;
  int _totalPages = 1;

  bool get hasMore => _page < _totalPages;

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<ApiResponse> _fetch(int page) {
    final query = <String, String>{
      'page': '$page',
      'limit': '10',
      'status': 'APPROVED',
    };
    final blood = bloodFilter.value;
    if (blood != null) query['bloodType'] = blood;
    final urgency = urgencyFilter.value;
    if (urgency != null) query['urgency'] = urgency;
    return _api.get('/blood-requests', query: query);
  }

  List<BloodRequest> _parseItems(Map<String, dynamic> data) {
    final raw = data['items'];
    if (raw is! List) return [];
    return raw
        .whereType<Map>()
        .map((e) => BloodRequest.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<void> load() async {
    loading.value = true;
    error.value = null;
    _page = 1;
    final r = await _fetch(1);
    if (r.success && r.data is Map) {
      final data = Map<String, dynamic>.from(r.data as Map);
      items.assignAll(_parseItems(data));
      _totalPages = asInt(data['totalPages'], 1);
      total.value = asInt(data['total']);
    } else {
      error.value = r.displayMessage;
    }
    loading.value = false;
  }

  Future<void> loadMore() async {
    if (loading.value || loadingMore.value || !hasMore) return;
    loadingMore.value = true;
    final r = await _fetch(_page + 1);
    if (r.success && r.data is Map) {
      final data = Map<String, dynamic>.from(r.data as Map);
      _page += 1;
      _totalPages = asInt(data['totalPages'], _totalPages);
      items.addAll(_parseItems(data));
    }
    loadingMore.value = false;
  }

  void setBlood(String? value) {
    bloodFilter.value = value;
    load();
  }

  void setUrgency(String? value) {
    urgencyFilter.value = value;
    load();
  }

  /// Returns the server's message on success, or null on failure (error is toasted).
  Future<bool> create(Map<String, dynamic> body) async {
    final r = await _api.post('/blood-requests', body: body);
    if (!r.success) {
      Toast.error(r.displayMessage);
      return false;
    }
    Toast.success(r.message ?? 'request_created'.tr);
    load();
    return true;
  }
}
