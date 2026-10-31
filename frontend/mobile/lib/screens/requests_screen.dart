import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/requests_controller.dart';
import '../core/constants.dart';
import '../core/theme.dart';
import '../core/utils.dart';
import '../widgets/request_card.dart';
import '../widgets/state_views.dart';
import 'request_detail_screen.dart';

class RequestsScreen extends StatefulWidget {
  const RequestsScreen({super.key});

  @override
  State<RequestsScreen> createState() => _RequestsScreenState();
}

class _RequestsScreenState extends State<RequestsScreen> {
  final RequestsController c = Get.find<RequestsController>();
  final ScrollController _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _scroll.addListener(() {
      if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 240) {
        c.loadMore();
      }
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  Widget _chip(String label, bool selected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        selectedColor: AppColors.primary,
        labelStyle: TextStyle(
          color: selected ? Colors.white : null,
          fontWeight: FontWeight.w600,
        ),
        showCheckmark: false,
        onSelected: (_) => onTap(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
          child: Text('requests_title'.tr,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
        ),
        SizedBox(
          height: 48,
          child: Obx(() => ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  _chip('filter_all'.tr, c.bloodFilter.value == null, () => c.setBlood(null)),
                  for (final t in AppConstants.bloodTypes)
                    _chip(bloodLabel(t), c.bloodFilter.value == t, () => c.setBlood(t)),
                ],
              )),
        ),
        SizedBox(
          height: 48,
          child: Obx(() => ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  _chip('filter_all'.tr, c.urgencyFilter.value == null, () => c.setUrgency(null)),
                  for (final u in AppConstants.urgencies)
                    _chip('urgency_$u'.tr, c.urgencyFilter.value == u, () => c.setUrgency(u)),
                ],
              )),
        ),
        Expanded(
          child: Obx(() {
            if (c.loading.value && c.items.isEmpty) return const LoadingView();
            if (c.error.value != null && c.items.isEmpty) {
              return ErrorView(message: c.error.value!, onRetry: c.load);
            }
            return RefreshIndicator(
              color: AppColors.primary,
              onRefresh: c.load,
              child: c.items.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        SizedBox(
                          height: 320,
                          child: EmptyView(
                            icon: Icons.bloodtype_outlined,
                            title: 'no_requests'.tr,
                            hint: 'no_requests_hint'.tr,
                          ),
                        ),
                      ],
                    )
                  : ListView.builder(
                      controller: _scroll,
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 96),
                      itemCount: c.items.length + (c.loadingMore.value ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index >= c.items.length) {
                          return const Padding(
                            padding: EdgeInsets.all(16),
                            child: Center(
                                child: CircularProgressIndicator(color: AppColors.primary)),
                          );
                        }
                        final r = c.items[index];
                        return RequestCard(
                          request: r,
                          onTap: () => Get.to(() => RequestDetailScreen(requestId: r.id)),
                        );
                      },
                    ),
            );
          }),
        ),
      ],
    );
  }
}
