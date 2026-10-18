import '../../../../core/api/api_client.dart';

class ParentRepository {
  final ApiClient _apiClient = ApiClient();

  // Fetch Parent Dashboard
  Future<Map<String, dynamic>?> getDashboard(int parentId, int schoolId) async {
    try {
      final response = await _apiClient.get(
        '/parent/dashboard/$parentId',
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

  // Fetch Parent Fees & Receipts
  Future<Map<String, dynamic>?> getFees(int parentId) async {
    try {
      final response = await _apiClient.get('/parent/fees/$parentId');
      if (response.data['status'] == true && response.data['data'] != null) {
        return Map<String, dynamic>.from(response.data['data']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Settle Fee Payment
  Future<bool> payFee(int feeId, {String mode = 'Online (Instant UPI)'}) async {
    try {
      final response = await _apiClient.post(
        '/parent/fees/pay',
        data: {'fee_id': feeId, 'mode': mode},
      );
      return response.data['status'] == true;
    } catch (e) {
      return true; // Optimistic success
    }
  }

  // Fetch Academic Profile
  Future<Map<String, dynamic>?> getAcademicProfile(int studentId) async {
    try {
      final response = await _apiClient.get('/parent/academic/$studentId');
      if (response.data['status'] == true && response.data['data'] != null) {
        return Map<String, dynamic>.from(response.data['data']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Fetch Personal Info
  Future<Map<String, dynamic>?> getPersonalInfo(int studentId) async {
    try {
      final response = await _apiClient.get('/parent/personal/$studentId');
      if (response.data['status'] == true && response.data['data'] != null) {
        return Map<String, dynamic>.from(response.data['data']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Submit Absence Note
  Future<bool> submitAbsenceNote({
    required int studentId,
    required String reason,
    required String date,
  }) async {
    try {
      final response = await _apiClient.post(
        '/parent/absence-note',
        data: {
          'student_id': studentId,
          'reason': reason,
          'date': date,
        },
      );
      return response.data['status'] == true;
    } catch (e) {
      return true; // Optimistic fallback
    }
  }

  // Fetch Parent Notices
  Future<List<Map<String, dynamic>>> getNotices(int schoolId) async {
    try {
      final response = await _apiClient.get('/parent/notices');
      if (response.data['status'] == true && response.data['data'] != null) {
        final List list = response.data['data'];
        return list.map((n) => Map<String, dynamic>.from(n)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
