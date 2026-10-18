class School {
  final int id;
  final String name;
  final String? code;
  final String? email;
  final String? phone;
  final String? city;
  final String? logoUrl;
  final String status;

  const School({
    required this.id,
    required this.name,
    this.code,
    this.email,
    this.phone,
    this.city,
    this.logoUrl,
    this.status = 'active',
  });

  factory School.fromJson(Map<String, dynamic> json) {
    return School(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      code: json['school_code'],
      email: json['email'],
      phone: json['phone'],
      city: json['city'],
      logoUrl: json['logo'],
      status: json['status'] ?? 'active',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'school_code': code,
      'email': email,
      'phone': phone,
      'city': city,
      'logo': logoUrl,
      'status': status,
    };
  }
}
