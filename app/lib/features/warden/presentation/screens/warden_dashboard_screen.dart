import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class WardenDashboardScreen extends ConsumerWidget {
  const WardenDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final name = user?.fullName.isNotEmpty == true ? user!.fullName : 'Hostel Warden';

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Warden',
        switcherLabel: '$name (Block A & B)',
        onProfileTap: () => ref.read(authProvider.notifier).logout(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Residential & Mess Services', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text('Hostel Allocations & Dining Schedule', style: EduPulseTypography.bodySm()),
            const SizedBox(height: 16),

            // Hostel Occupancy Stats
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: EduPulseColors.surfaceCard,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: EduPulseColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Hostel Occupancy', style: EduPulseTypography.bodySm()),
                        const SizedBox(height: 4),
                        Text('214 / 240', style: EduPulseTypography.tabularLg(color: EduPulseColors.primary)),
                        const SizedBox(height: 4),
                        const StatusPill(label: '89% Occupied', variant: PillVariant.info),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: EduPulseColors.surfaceCard,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: EduPulseColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Vacant Beds', style: EduPulseTypography.bodySm()),
                        const SizedBox(height: 4),
                        Text('26 Beds', style: EduPulseTypography.tabularLg(color: EduPulseColors.success)),
                        const SizedBox(height: 4),
                        const StatusPill(label: 'Available Now', variant: PillVariant.success),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Dining & Mess Menu Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: EduPulseColors.surfaceCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: EduPulseColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.restaurant, size: 18, color: EduPulseColors.primary),
                          const SizedBox(width: 6),
                          Text("Today's Dining Menu", style: EduPulseTypography.labelLg()),
                        ],
                      ),
                      const StatusPill(label: 'Active Serving', variant: PillVariant.success),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildMealSlot('Breakfast (07:30 - 09:00)', 'Oatmeal, Scrambled Eggs, Fresh Fruit, Tea/Juice', true),
                  const SizedBox(height: 8),
                  _buildMealSlot('Lunch (12:30 - 02:00)', 'Herb Roasted Chicken / Paneer Tikka, Rice, Dal, Green Salad', true),
                  const SizedBox(height: 8),
                  _buildMealSlot('Dinner (19:30 - 21:00)', 'Vegetable Pulao, Lentil Soup, Warm Breads, Dessert', false),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Warden Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      _showAllocateRoomDialog(context);
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.hotel, size: 16),
                        SizedBox(width: 6),
                        Text('Allocate Bed'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      _showUpdateMenuDialog(context);
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.restaurant_menu, size: 16),
                        SizedBox(width: 6),
                        Text('Update Menu'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Resident Room Allocations Preview
            Text('Recent Room Allocations', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),
            _buildAllocationRow('Marcus Chen (1005)', 'Room 204 • Bed A', 'Block B', 'Allocated'),
            const SizedBox(height: 8),
            _buildAllocationRow('Liam Vance (1002)', 'Room 108 • Bed B', 'Block A', 'Allocated'),
            const SizedBox(height: 8),
            _buildAllocationRow('Alex Doe (1001)', 'Room 302 • Bed A', 'Block A', 'Allocated'),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildMealSlot(String title, String items, bool isServed) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: EduPulseTypography.labelMd()),
              Text(isServed ? '✓ Completed' : '• Upcoming', style: EduPulseTypography.labelSm(color: isServed ? EduPulseColors.textMuted : EduPulseColors.primary)),
            ],
          ),
          const SizedBox(height: 4),
          Text(items, style: EduPulseTypography.bodySm()),
        ],
      ),
    );
  }

  Widget _buildAllocationRow(String student, String room, String block, String status) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(student, style: EduPulseTypography.labelMd()),
              Text('$room • $block', style: EduPulseTypography.bodySm()),
            ],
          ),
          const StatusPill(label: 'Active Resident', variant: PillVariant.info),
        ],
      ),
    );
  }

  void _showAllocateRoomDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hostel • Room Allocation'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(
              decoration: InputDecoration(
                labelText: 'Student Roll No / ID',
                hintText: 'e.g. 1001 (Alex Doe)',
                prefixIcon: Icon(Icons.person),
              ),
            ),
            SizedBox(height: 12),
            TextField(
              decoration: InputDecoration(
                labelText: 'Hostel Block',
                hintText: 'Block A (Senior Boys)',
                prefixIcon: Icon(Icons.apartment),
              ),
            ),
            SizedBox(height: 12),
            TextField(
              decoration: InputDecoration(
                labelText: 'Room & Bed Number',
                hintText: 'Room 304 • Bed B',
                prefixIcon: Icon(Icons.bed),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Room allocation confirmed and resident registered!'),
                  backgroundColor: EduPulseColors.success,
                ),
              );
            },
            child: const Text('Confirm Allocation'),
          ),
        ],
      ),
    );
  }

  void _showUpdateMenuDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Mess • Update Daily Menu'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(
              decoration: InputDecoration(
                labelText: 'Meal Type',
                hintText: 'Dinner (19:30 - 21:00)',
              ),
            ),
            SizedBox(height: 12),
            TextField(
              decoration: InputDecoration(
                labelText: 'Menu Items',
                hintText: 'Vegetable Pulao, Paneer Masala, Salad, Kheer',
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Dining schedule updated for all hostel residents!'),
                  backgroundColor: EduPulseColors.success,
                ),
              );
            },
            child: const Text('Save Menu'),
          ),
        ],
      ),
    );
  }
}
