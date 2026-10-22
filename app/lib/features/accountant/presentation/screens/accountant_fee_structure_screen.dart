import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/accountant_navigation_drawer.dart';

class AccountantFeeStructureScreen extends ConsumerStatefulWidget {
  const AccountantFeeStructureScreen({super.key});

  @override
  ConsumerState<AccountantFeeStructureScreen> createState() => _AccountantFeeStructureScreenState();
}

class _AccountantFeeStructureScreenState extends ConsumerState<AccountantFeeStructureScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final List<Map<String, dynamic>> _structures = [
    {
      'id': 1,
      'class': 'Primary (Grades 1-5)',
      'monthly_fee': 3500,
      'admission_fee': 10000,
      'registration_fee': 2500,
      'other_fee': 1000,
      'students_count': 320,
    },
    {
      'id': 2,
      'class': 'Middle School (Grades 6-8)',
      'monthly_fee': 4200,
      'admission_fee': 12000,
      'registration_fee': 2500,
      'other_fee': 1500,
      'students_count': 410,
    },
    {
      'id': 3,
      'class': 'High School (Grades 9-10)',
      'monthly_fee': 4800,
      'admission_fee': 15000,
      'registration_fee': 3000,
      'other_fee': 2000,
      'students_count': 280,
    },
    {
      'id': 4,
      'class': 'Senior Secondary (Grades 11-12 Science)',
      'monthly_fee': 5500,
      'admission_fee': 18000,
      'registration_fee': 3500,
      'other_fee': 2500,
      'students_count': 140,
    },
    {
      'id': 5,
      'class': 'Senior Secondary (Grades 11-12 Commerce)',
      'monthly_fee': 5100,
      'admission_fee': 16000,
      'registration_fee': 3500,
      'other_fee': 2000,
      'students_count': 90,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const AccountantNavigationDrawer(currentRoute: '/accountant/fees-structure'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Accountant',
        switcherLabel: 'Fee Structure',
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Fee Structures', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Class-wise baseline fee schedules', style: EduPulseTypography.bodySm()),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showAddStructureDialog(context),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Add Plan'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7C3AED),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Summary Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF7C3AED).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF7C3AED).withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF7C3AED),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.receipt_long, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '5 Active Grade Plans',
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: EduPulseColors.textHeadline),
                        ),
                        Text(
                          'Governs monthly fee generation for 1,240 enrolled students',
                          style: EduPulseTypography.bodySm(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Structure Cards
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _structures.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final item = _structures[i];
                return _buildStructureCard(item);
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildStructureCard(Map<String, dynamic> item) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  item['class'] as String,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: EduPulseColors.textHeadline),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: EduPulseColors.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${item['students_count']} Students',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: EduPulseColors.primary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Fee Components Breakdown
          Row(
            children: [
              Expanded(
                child: _buildFeeColumn('Monthly Tuition', '₹${item['monthly_fee']}', isHighlight: true),
              ),
              Expanded(
                child: _buildFeeColumn('Admission Fee', '₹${item['admission_fee']}'),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildFeeColumn('Registration', '₹${item['registration_fee']}'),
              ),
              Expanded(
                child: _buildFeeColumn('Other Charges', '₹${item['other_fee']}'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: EduPulseColors.borderLight),
          const SizedBox(height: 10),

          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Editing structure for ${item['class']}')),
                  );
                },
                icon: const Icon(Icons.edit_outlined, size: 16),
                label: const Text('Edit', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeeColumn(String label, String amount, {bool isHighlight = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
        const SizedBox(height: 2),
        Text(
          amount,
          style: TextStyle(
            fontSize: isHighlight ? 15 : 13,
            fontWeight: isHighlight ? FontWeight.w800 : FontWeight.w600,
            color: isHighlight ? const Color(0xFF7C3AED) : EduPulseColors.textHeadline,
          ),
        ),
      ],
    );
  }

  void _showAddStructureDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Fee Structure'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              TextField(
                decoration: InputDecoration(
                  labelText: 'Class / Grade Name',
                  hintText: 'e.g. Grade 11 - Arts',
                ),
              ),
              SizedBox(height: 10),
              TextField(
                decoration: InputDecoration(
                  labelText: 'Monthly Tuition Fee (₹)',
                  hintText: '4500',
                ),
                keyboardType: TextInputType.number,
              ),
              SizedBox(height: 10),
              TextField(
                decoration: InputDecoration(
                  labelText: 'Admission Fee (₹)',
                  hintText: '12000',
                ),
                keyboardType: TextInputType.number,
              ),
              SizedBox(height: 10),
              TextField(
                decoration: InputDecoration(
                  labelText: 'Registration Fee (₹)',
                  hintText: '2500',
                ),
                keyboardType: TextInputType.number,
              ),
              SizedBox(height: 10),
              TextField(
                decoration: InputDecoration(
                  labelText: 'Other Charges (₹)',
                  hintText: '1000',
                ),
                keyboardType: TextInputType.number,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('New fee structure created successfully!'),
                  backgroundColor: EduPulseColors.success,
                ),
              );
            },
            child: const Text('Save Structure'),
          ),
        ],
      ),
    );
  }
}
