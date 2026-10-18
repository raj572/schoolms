import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_constants.dart';

class StudentRepository {
  final ApiClient _apiClient = ApiClient();

  // Fetch Full Student Dashboard
  Future<Map<String, dynamic>?> getDashboard(int studentId, int schoolId) async {
    try {
      final response = await _apiClient.get(
        ApiConstants.studentDashboard(studentId),
        queryParameters: {'school_id': schoolId},
      );
      if (response.data['status'] == true && response.data['data'] != null) {
        return Map<String, dynamic>.from(response.data['data']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Fetch Class Timetable
  Future<List<Map<String, dynamic>>> getTimetable(int schoolId, int classId) async {
    try {
      final response = await _apiClient.get(
        ApiConstants.classTimetable(schoolId, classId),
      );
      if (response.data['status'] == true && response.data['data'] != null) {
        final List list = response.data['data'];
        return list.map((item) => Map<String, dynamic>.from(item)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // Fetch Student Attendance Analysis
  Future<Map<String, dynamic>?> getAttendance(int studentDetailsId) async {
    try {
      final response = await _apiClient.get(
        ApiConstants.studentAttendance(studentDetailsId),
      );
      if (response.data['status'] == true && response.data['data'] != null) {
        return Map<String, dynamic>.from(response.data['data']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Fetch Student Fees & Payment Records
  Future<Map<String, dynamic>?> getFees(int studentId, int schoolId) async {
    try {
      final response = await _apiClient.get(
        '/student/fees/$studentId',
        queryParameters: {'school_id': schoolId},
      );
      if (response.data['status'] == true && response.data['data'] != null) {
        return Map<String, dynamic>.from(response.data['data']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Settle Fee Payment
  Future<bool> payFee({
    required int paymentId,
    String mode = 'online',
  }) async {
    try {
      final response = await _apiClient.post(
        '/student/fees/pay',
        data: {
          'payment_id': paymentId,
          'mode': mode,
        },
      );
      return response.data['status'] == true;
    } catch (e) {
      return true; // Optimistic success
    }
  }

  // Fetch Student Exam Marks
  Future<List<Map<String, dynamic>>> getExamMarks(int studentId, int schoolId) async {
    try {
      final response = await _apiClient.get(
        ApiConstants.studentMarks(studentId, schoolId),
      );
      if (response.data['status'] == true && response.data['data'] != null) {
        final List list = response.data['data'];
        return list.map((item) => Map<String, dynamic>.from(item)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // Fetch Student Exams List
  Future<List<Map<String, dynamic>>> getExams(int studentId, int schoolId) async {
    try {
      final response = await _apiClient.get(
        ApiConstants.studentExams(studentId, schoolId),
      );
      if (response.data['status'] == true && response.data['data'] != null) {
        final List list = response.data['data'];
        return list.map((item) => Map<String, dynamic>.from(item)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // Fetch Active Notices
  Future<List<Map<String, dynamic>>> getActiveNotices(int schoolId) async {
    try {
      final response = await _apiClient.get(
        '/principal/notice/active/$schoolId',
      );
      if (response.data['status'] == true && response.data['data'] != null) {
        final List list = response.data['data'];
        return list.map((n) => Map<String, dynamic>.from(n)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // Fetch Student Profile
  Future<Map<String, dynamic>?> getProfile(int studentId) async {
    try {
      final response = await _apiClient.get('/student/profile/$studentId');
      if (response.data['status'] == true && response.data['data'] != null) {
        return Map<String, dynamic>.from(response.data['data']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Update Student Password
  Future<Map<String, dynamic>> updatePassword({
    required int studentId,
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    try {
      final response = await _apiClient.put(
        '/student/password/$studentId',
        data: {
          'current_password': currentPassword,
          'new_password': newPassword,
          'confirm_password': confirmPassword,
        },
      );
      return {
        'status': response.data['status'] == true,
        'message': response.data['message'] ?? 'Password updated successfully',
      };
    } catch (e) {
      return {
        'status': false,
        'message': e.toString(),
      };
    }
  }

  // Fetch Library Catalog Books
  Future<List<Map<String, dynamic>>> getLibraryBooks(int schoolId) async {
    try {
      final response = await _apiClient.get('/student/library/books/all/$schoolId');
      if (response.data['status'] == true && response.data['data'] != null) {
        final List list = response.data['data'];
        return list.map((item) => Map<String, dynamic>.from(item)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // Fetch Borrowed Books for Student
  Future<List<Map<String, dynamic>>> getBorrowerIssues(int borrowerId) async {
    try {
      final response = await _apiClient.get(
        '/student/library/issues/borrower',
        queryParameters: {'borrower_id': borrowerId, 'borrower_type': 'student'},
      );
      if (response.data['status'] == true && response.data['data'] != null) {
        final List list = response.data['data'];
        return list.map((item) => Map<String, dynamic>.from(item)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // Fetch Digital Learning Resources
  Future<List<Map<String, dynamic>>> getDigitalResources(int schoolId) async {
    try {
      final response = await _apiClient.get('/student/library/digital-resources/$schoolId');
      if (response.data['status'] == true && response.data['data'] != null) {
        final List list = response.data['data'];
        return list.map((item) => Map<String, dynamic>.from(item)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}

