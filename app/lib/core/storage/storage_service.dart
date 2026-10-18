import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _keyToken = 'jwt_auth_token';
  static const String _keyRole = 'user_role';
  static const String _keySchoolId = 'active_school_id';
  static const String _keyUserId = 'user_id';
  static const String _keyStudentId = 'student_id';
  static const String _keyFullName = 'user_full_name';
  static const String _keyEmail = 'user_email';

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  // Save auth session
  Future<void> saveAuthSession({
    required String token,
    required String role,
    required int? schoolId,
    required int userId,
    int? studentId,
    String? fullName,
    String? email,
  }) async {
    await _secureStorage.write(key: _keyToken, value: token);
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyRole, role);
    if (schoolId != null) await prefs.setInt(_keySchoolId, schoolId);
    await prefs.setInt(_keyUserId, userId);
    if (studentId != null) await prefs.setInt(_keyStudentId, studentId);
    if (fullName != null) await prefs.setString(_keyFullName, fullName);
    if (email != null) await prefs.setString(_keyEmail, email);
  }

  // Read Token
  Future<String?> getToken() async {
    return await _secureStorage.read(key: _keyToken);
  }

  // Read Role
  Future<String?> getRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyRole);
  }

  // Read School ID
  Future<int?> getSchoolId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_keySchoolId);
  }

  // Read Student ID
  Future<int?> getStudentId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_keyStudentId);
  }

  // Read User ID
  Future<int?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_keyUserId);
  }

  // Read Full Name
  Future<String?> getFullName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyFullName);
  }

  // Read Email
  Future<String?> getEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyEmail);
  }

  // Clear Session (Logout)
  Future<void> clearSession() async {
    await _secureStorage.delete(key: _keyToken);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyRole);
    await prefs.remove(_keySchoolId);
    await prefs.remove(_keyUserId);
    await prefs.remove(_keyStudentId);
    await prefs.remove(_keyFullName);
    await prefs.remove(_keyEmail);
  }
}
