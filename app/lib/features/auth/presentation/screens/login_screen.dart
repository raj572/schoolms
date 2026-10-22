import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../data/auth_repository.dart';
import '../../domain/models/school.dart';
import '../controllers/auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'student@school.com');
  final _passwordController = TextEditingController(text: 'password');
  
  String _selectedRole = 'student';
  School? _selectedSchool;
  List<School> _schools = [];
  bool _isLoadingSchools = false;
  bool _obscurePassword = true;

  final List<Map<String, String>> _roles = [
    {'key': 'student', 'label': 'Student', 'icon': '🎒'},
    {'key': 'parent', 'label': 'Parent', 'icon': '👨‍👩‍👦'},
    {'key': 'teacher', 'label': 'Teacher', 'icon': '👩‍🏫'},
    {'key': 'principal', 'label': 'Principal', 'icon': '🏛️'},
    {'key': 'accountant', 'label': 'Accountant', 'icon': '💼'},
    {'key': 'librarian', 'label': 'Librarian', 'icon': '📚'},
    {'key': 'warden', 'label': 'Hostel Warden', 'icon': '🏨'},
    {'key': 'administrator', 'label': 'School Admin', 'icon': '⚙️'},
    {'key': 'super_admin', 'label': 'Super Admin', 'icon': '👑'},
  ];

  @override
  void initState() {
    super.initState();
    _loadSchools();
  }

  Future<void> _loadSchools() async {
    if (mounted) setState(() => _isLoadingSchools = true);
    final schools = await AuthRepository().getSchools();
    if (!mounted) return;
    setState(() {
      _schools = schools;
      _isLoadingSchools = false;
      if (schools.isNotEmpty) {
        _selectedSchool = schools.first;
      } else {
        // Fallback demo school
        _selectedSchool = const School(
          id: 1,
          name: 'Demo International School',
          code: 'DEMO001',
        );
      }
    });
  }

  void _onRoleChanged(String role) {
    setState(() {
      _selectedRole = role;
      switch (role) {
        case 'student':
          _emailController.text = 'student@school.com';
          break;
        case 'parent':
          _emailController.text = 'parent@school.com';
          break;
        case 'teacher':
          _emailController.text = 'teacher@school.com';
          break;
        case 'principal':
          _emailController.text = 'principal@school.com';
          break;
        case 'accountant':
          _emailController.text = 'accountant@school.com';
          break;
        case 'librarian':
          _emailController.text = 'librarian@school.com';
          break;
        case 'warden':
          _emailController.text = 'warden@school.com';
          break;
        case 'administrator':
          _emailController.text = 'admin@school.com';
          break;
        case 'super_admin':
          _emailController.text = 'superadmin@school.com';
          break;
      }
      _passwordController.text = 'password';
    });
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (_selectedRole == 'super_admin') {
      await ref.read(authProvider.notifier).superAdminLogin(
        email: email,
        password: password,
      );
    } else {
      if (_selectedSchool == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select an institution')),
        );
        return;
      }
      final success = await ref.read(authProvider.notifier).loginWithSchool(
        email: email,
        password: password,
        role: _selectedRole,
        schoolId: _selectedSchool!.id,
      );
      if (!success && _selectedRole == 'administrator') {
        await ref.read(authProvider.notifier).simpleLogin(
          email: email,
          password: password,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // App Icon & Header
                  Center(
                    child: Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: EduPulseColors.primary,
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: const [
                          BoxShadow(
                            color: Color.fromRGBO(37, 99, 235, 0.25),
                            blurRadius: 16,
                            offset: Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.school_rounded,
                          color: Colors.white,
                          size: 36,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      'LEARNAZ',
                      style: EduPulseTypography.headlineXl(
                        color: EduPulseColors.secondary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Center(
                    child: Text(
                      'Modern Academic Management Portal',
                      style: EduPulseTypography.bodySm(
                        color: EduPulseColors.textMuted,
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Role Selector Horizontal Carousel
                  Text(
                    'SELECT ROLE',
                    style: EduPulseTypography.labelSm(
                      color: EduPulseColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 42,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _roles.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        final r = _roles[index];
                        final isSelected = r['key'] == _selectedRole;
                        return GestureDetector(
                          onTap: () => _onRoleChanged(r['key']!),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? EduPulseColors.primary
                                  : EduPulseColors.surfaceCard,
                              borderRadius: BorderRadius.circular(9999),
                              border: Border.all(
                                color: isSelected
                                    ? EduPulseColors.primary
                                    : EduPulseColors.border,
                              ),
                            ),
                            child: Row(
                              children: [
                                Text(r['icon']!, style: const TextStyle(fontSize: 14)),
                                const SizedBox(width: 6),
                                Text(
                                  r['label']!,
                                  style: EduPulseTypography.labelSm(
                                    color: isSelected
                                        ? Colors.white
                                        : EduPulseColors.textHeadline,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 20),

                  // School Selector (for all roles except super_admin)
                  if (_selectedRole != 'super_admin') ...[
                    Text(
                      'INSTITUTION',
                      style: EduPulseTypography.labelSm(
                        color: EduPulseColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: EduPulseColors.surfaceCard,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: EduPulseColors.border),
                      ),
                      child: _isLoadingSchools
                          ? const Center(
                              child: Padding(
                                padding: EdgeInsets.all(12),
                                child: SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                ),
                              ),
                            )
                          : DropdownButtonHideUnderline(
                              child: DropdownButton<School>(
                                isExpanded: true,
                                value: _selectedSchool,
                                hint: const Text('Select Institution'),
                                items: (_schools.isNotEmpty ? _schools : [
                                  const School(id: 1, name: 'Demo International School', code: 'DEMO001')
                                ]).map((s) {
                                  return DropdownMenuItem<School>(
                                    value: s,
                                    child: Text(
                                      s.name,
                                      style: EduPulseTypography.bodyMd(
                                        color: EduPulseColors.textHeadline,
                                      ),
                                    ),
                                  );
                                }).toList(),
                                onChanged: (val) {
                                  if (val != null) setState(() => _selectedSchool = val);
                                },
                              ),
                            ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Email Input
                  Text(
                    'EMAIL ADDRESS',
                    style: EduPulseTypography.labelSm(
                      color: EduPulseColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      hintText: 'name@school.com',
                      prefixIcon: Icon(Icons.email_outlined, size: 20),
                    ),
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Email is required';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Password Input
                  Text(
                    'PASSWORD',
                    style: EduPulseTypography.labelSm(
                      color: EduPulseColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      hintText: 'Enter password',
                      prefixIcon: const Icon(Icons.lock_outline, size: 20),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_off : Icons.visibility,
                          size: 20,
                        ),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Password is required';
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),

                  // Error Message
                  if (authState.errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: EduPulseColors.errorContainer,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: EduPulseColors.error, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              authState.errorMessage!,
                              style: EduPulseTypography.bodySm(
                                color: EduPulseColors.onErrorContainer,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Sign In Button
                  ElevatedButton(
                    onPressed: authState.isLoading ? null : _handleLogin,
                    child: authState.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Text('Sign In to Learnaz'),
                  ),

                  const SizedBox(height: 24),

                  // Demo Quick Tip
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: EduPulseColors.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: EduPulseColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const StatusPill(
                              label: 'SEEDED TEST ACCOUNTS',
                              variant: PillVariant.info,
                            ),
                            const Spacer(),
                            Text(
                              'Password: password',
                              style: EduPulseTypography.labelSm(
                                color: EduPulseColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Tap any role chip above to switch accounts. All 9 roles seeded in RoleSeeder are pre-configured.',
                          style: EduPulseTypography.bodySm(
                            color: EduPulseColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
