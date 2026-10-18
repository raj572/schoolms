class AuthUser {
  final int id;
  final String email;
  final String fullName;
  final String role;
  final int? schoolId;
  final int? studentId;
  final String? phone;
  final bool emailVerified;
  final bool subscriptionActive;

  const AuthUser({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.schoolId,
    this.studentId,
    this.phone,
    this.emailVerified = true,
    this.subscriptionActive = true,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] ?? json['user_id'] ?? 0,
      email: json['email'] ?? '',
      fullName: json['full_name'] ?? json['name'] ?? json['username'] ?? '',
      role: json['role'] ?? '',
      schoolId: json['school_id'] != null ? int.tryParse(json['school_id'].toString()) : null,
      studentId: json['student_id'] != null ? int.tryParse(json['student_id'].toString()) : null,
      phone: json['phone'],
      emailVerified: json['email_verified'] == true || json['email_verified'] == 1,
      subscriptionActive: json['subscription_active'] == true || json['subscription_active'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'full_name': fullName,
      'role': role,
      'school_id': schoolId,
      'student_id': studentId,
      'phone': phone,
      'email_verified': emailVerified,
      'subscription_active': subscriptionActive,
    };
  }
}
