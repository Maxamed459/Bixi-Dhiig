import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../controllers/activity_controller.dart';
import '../controllers/nav_controller.dart';
import '../controllers/requests_controller.dart';
import 'activity_screen.dart';
import 'create_request_screen.dart';
import 'home_screen.dart';
import 'profile_screen.dart';
import 'requests_screen.dart';

/// Bottom-navigation container for the signed-in donor/requester.
class ShellScreen extends StatefulWidget {
  const ShellScreen({super.key});

  @override
  State<ShellScreen> createState() => _ShellScreenState();
}

class _ShellScreenState extends State<ShellScreen> {
  late final NavController nav;

  @override
  void initState() {
    super.initState();
    nav = Get.put(NavController());
    Get.put(RequestsController());
    Get.put(ActivityController());
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final i = nav.index.value;
      return Scaffold(
        body: SafeArea(
          child: IndexedStack(
            index: i,
            children: const [
              HomeScreen(),
              RequestsScreen(),
              ActivityScreen(),
              ProfileScreen(),
            ],
          ),
        ),
        floatingActionButton: i == 1
            ? FloatingActionButton.extended(
                onPressed: () => Get.to(() => const CreateRequestScreen()),
                icon: const Icon(Icons.add),
                label: Text('create_request'.tr),
              )
            : null,
        bottomNavigationBar: NavigationBar(
          selectedIndex: i,
          onDestinationSelected: (v) => nav.index.value = v,
          destinations: [
            NavigationDestination(
              icon: const Icon(Icons.home_outlined),
              selectedIcon: const Icon(Icons.home),
              label: 'nav_home'.tr,
            ),
            NavigationDestination(
              icon: const Icon(Icons.bloodtype_outlined),
              selectedIcon: const Icon(Icons.bloodtype),
              label: 'nav_requests'.tr,
            ),
            NavigationDestination(
              icon: const Icon(Icons.timeline_outlined),
              selectedIcon: const Icon(Icons.timeline),
              label: 'nav_activity'.tr,
            ),
            NavigationDestination(
              icon: const Icon(Icons.person_outline),
              selectedIcon: const Icon(Icons.person),
              label: 'nav_profile'.tr,
            ),
          ],
        ),
      );
    });
  }
}
