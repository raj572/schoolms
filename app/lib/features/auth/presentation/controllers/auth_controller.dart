import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/auth_repository.dart';
import '../../domain/models/auth_user.dart';
import '../../../../core/storage/storage_service.dart';

class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final AuthUser? user;
  final String? errorMessage;

  const AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.user,
    this.errorMessage,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    AuthUser? user,
    String? errorMessage,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      errorMessage: errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository = AuthRepository();
  final StorageService _storageService = StorageService();

  AuthNotifier() : super(const AuthState(isLoading: true)) {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    state = state.copyWith(isLoading: true);
    final token = await _storageService.getToken();
    final role = await _storageService.getRole();
    final userId = await _storageService.getUserId();
    final schoolId = await _storageService.getSchoolId();
    final studentId = await _storageService.getStudentId();
    final fullName = await _storageService.getFullName();
    final email = await _storageService.getEmail();

    if (token != null && role != null && userId != null) {
      final user = AuthUser(
        id: userId,
        email: email ?? '',
        fullName: fullName ?? 'User',
        role: role,
        schoolId: schoolId,
        studentId: studentId,
      );
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: user,
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: false,
        user: null,
      );
    }
  }

  Future<bool> loginWithSchool({
    required String email,
    required String password,
    required String role,
    required int schoolId,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final res = await _repository.loginWithSchool(
      email: email,
      password: password,
      role: role,
      schoolId: schoolId,
    );

    if (res['status'] == true) {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: res['user'] as AuthUser,
      );
      return true;
    } else {
      state = state.copyWith(
        isLoading: false,
        errorMessage: res['message'],
      );
      return false;
    }
  }

  Future<bool> simpleLogin({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final res = await _repository.simpleLogin(
      email: email,
      password: password,
    );

    if (res['status'] == true) {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: res['user'] as AuthUser,
      );
      return true;
    } else {
      state = state.copyWith(
        isLoading: false,
        errorMessage: res['message'],
      );
      return false;
    }
  }

  Future<bool> superAdminLogin({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    final res = await _repository.superAdminLogin(
      email: email,
      password: password,
    );

    if (res['status'] == true) {
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: res['user'] as AuthUser,
      );
      return true;
    } else {
      state = state.copyWith(
        isLoading: false,
        errorMessage: res['message'],
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AuthState(isAuthenticated: false, user: null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
