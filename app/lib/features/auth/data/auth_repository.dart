import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_constants.dart';
import '../../../core/storage/storage_service.dart';
import '../domain/models/auth_user.dart';
import '../domain/models/school.dart';

class AuthRepository {
  final ApiClient _apiClient = ApiClient();
  final StorageService _storageService = StorageService();

  // Fetch Public School List
  Future<List<School>> getSchools() async {
    try {
      final response = await _apiClient.get(ApiConstants.publicSchools);
      if (response.data['status'] == true && response.data['data'] != null) {
        final List list = response.data['data'];
        return list.map((item) => School.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // Login with School (for Student, Parent, Teacher, Principal, Accountant, Librarian, Warden)
  Future<Map<String, dynamic>> loginWithSchool({
    required String email,
    required String password,
    required String role,
    required int schoolId,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.schoolLogin(schoolId),
        data: {
          'email': email,
          'password': password,
          'role': role,
        },
      );

      final data = response.data;
      if (data['status'] == true && data['token'] != null) {
        final token = data['token'];
        
        // Fetch current user details with token
        final userResponse = await _apiClient.get(
          ApiConstants.currentUser,
          options: Options(headers: {'Authorization': 'Bearer $token'}),
        );

        final userData = userResponse.data['data'] ?? {};
        final authUser = AuthUser.fromJson({
          ...userData,
          'role': role,
          'school_id': schoolId,
        });

        // Persist session
        await _storageService.saveAuthSession(
          token: token,
          role: authUser.role,
          schoolId: authUser.schoolId,
          userId: authUser.id,
          studentId: authUser.studentId,
          fullName: authUser.fullName,
          email: authUser.email,
        );

        return {'status': true, 'user': authUser, 'token': token};
      }
      return {'status': false, 'message': data['message'] ?? 'Login failed'};
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Network error occurred';
      return {'status': false, 'message': msg};
    } catch (e) {
      return {'status': false, 'message': e.toString()};
    }
  }

  // Simple Login (for Administrator)
  Future<Map<String, dynamic>> simpleLogin({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.simpleLogin,
        data: {
          'email': email,
          'password': password,
        },
      );

      final data = response.data;
      if (data['status'] == true && data['token'] != null) {
        final token = data['token'];
        final userData = data['data'] ?? {};
        final authUser = AuthUser.fromJson(userData);

        await _storageService.saveAuthSession(
          token: token,
          role: authUser.role,
          schoolId: authUser.schoolId,
          userId: authUser.id,
          fullName: authUser.fullName,
          email: authUser.email,
        );

        return {'status': true, 'user': authUser, 'token': token};
      }
      return {'status': false, 'message': data['message'] ?? 'Login failed'};
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Network error occurred';
      return {'status': false, 'message': msg};
    } catch (e) {
      return {'status': false, 'message': e.toString()};
    }
  }

  // Super Admin Login
  Future<Map<String, dynamic>> superAdminLogin({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.superAdminLogin,
        data: {
          'email': email,
          'password': password,
        },
      );

      final data = response.data;
      if (data['status'] == true && data['token'] != null) {
        final token = data['token'];
        final userData = data['data'] ?? {};
        final authUser = AuthUser.fromJson({
          ...userData,
          'role': 'super_admin',
        });

        await _storageService.saveAuthSession(
          token: token,
          role: 'super_admin',
          schoolId: null,
          userId: authUser.id,
          fullName: authUser.fullName,
          email: authUser.email,
        );

        return {'status': true, 'user': authUser, 'token': token};
      }
      return {'status': false, 'message': data['message'] ?? 'Login failed'};
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Network error occurred';
      return {'status': false, 'message': msg};
    } catch (e) {
      return {'status': false, 'message': e.toString()};
    }
  }

  // Logout
  Future<void> logout() async {
    await _storageService.clearSession();
  }
}
