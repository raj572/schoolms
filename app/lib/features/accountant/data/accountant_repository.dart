import '../../../../core/api/api_client.dart';

class AccountantRepository {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>?> getDashboardStats({int? schoolId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (schoolId != null) queryParams['school_id'] = schoolId;
      final res = await _apiClient.get('/accountant/dashboard/stats', queryParameters: queryParams);
      if (res.statusCode == 200 && res.data != null) {
        return res.data['data'] as Map<String, dynamic>?;
      }
    } catch (_) {}
    return null;
  }

  Future<List<dynamic>> getAccessibleSchools() async {
    try {
      final res = await _apiClient.get('/accountant/schools/accessible');
      if (res.statusCode == 200 && res.data != null) {
        return (res.data['data'] as List<dynamic>?) ?? [];
      }
    } catch (_) {}
    return [];
  }

  Future<List<dynamic>> getFeeStructures({int? schoolId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (schoolId != null) queryParams['school_id'] = schoolId;
      final res = await _apiClient.get('/accountant/fee-structure/all', queryParameters: queryParams);
      if (res.statusCode == 200 && res.data != null) {
        return (res.data['data'] as List<dynamic>?) ?? [];
      }
    } catch (_) {}
    return [];
  }

  Future<bool> createFeeStructure(Map<String, dynamic> data) async {
    try {
      final res = await _apiClient.post('/accountant/fee-structure/create', data: data);
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  Future<List<dynamic>> getMonthlyPayments({int? schoolId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (schoolId != null) queryParams['school_id'] = schoolId;
      final res = await _apiClient.get('/accountant/monthly-payments/all', queryParameters: queryParams);
      if (res.statusCode == 200 && res.data != null) {
        return (res.data['data'] as List<dynamic>?) ?? [];
      }
    } catch (_) {}
    return [];
  }

  Future<bool> generateMonthlyDues(int schoolId) async {
    try {
      final res = await _apiClient.post('/accountant/monthly-payments/generate-dues/$schoolId');
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  Future<List<dynamic>> getAnnualPayments({int? schoolId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (schoolId != null) queryParams['school_id'] = schoolId;
      final res = await _apiClient.get('/accountant/annual-payments/all', queryParameters: queryParams);
      if (res.statusCode == 200 && res.data != null) {
        return (res.data['data'] as List<dynamic>?) ?? [];
      }
    } catch (_) {}
    return [];
  }

  Future<List<dynamic>> getServiceCharges({int? schoolId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (schoolId != null) queryParams['school_id'] = schoolId;
      final res = await _apiClient.get('/accountant/service-charges/all', queryParameters: queryParams);
      if (res.statusCode == 200 && res.data != null) {
        return (res.data['data'] as List<dynamic>?) ?? [];
      }
    } catch (_) {}
    return [];
  }

  Future<bool> createServiceCharge(Map<String, dynamic> data) async {
    try {
      final res = await _apiClient.post('/accountant/service-charges/create', data: data);
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  Future<List<dynamic>> getPaymentHistory({int? schoolId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (schoolId != null) queryParams['school_id'] = schoolId;
      final res = await _apiClient.get('/accountant/reports/payment-history', queryParameters: queryParams);
      if (res.statusCode == 200 && res.data != null) {
        return (res.data['data'] as List<dynamic>?) ?? [];
      }
    } catch (_) {}
    return [];
  }

  Future<List<dynamic>> getStudentExtraServices(int schoolId) async {
    try {
      final res = await _apiClient.get('/accountant/extra-services/students/$schoolId');
      if (res.statusCode == 200 && res.data != null) {
        return (res.data['data'] as List<dynamic>?) ?? [];
      }
    } catch (_) {}
    return [];
  }

  Future<Map<String, dynamic>?> getFeeCollectionReport({int? schoolId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (schoolId != null) queryParams['school_id'] = schoolId;
      final res = await _apiClient.get('/accountant/reports/fee-collection', queryParameters: queryParams);
      if (res.statusCode == 200 && res.data != null) {
        return res.data['data'] as Map<String, dynamic>?;
      }
    } catch (_) {}
    return null;
  }

  Future<List<dynamic>> getPendingDuesReport({int? schoolId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (schoolId != null) queryParams['school_id'] = schoolId;
      final res = await _apiClient.get('/accountant/reports/pending-dues', queryParameters: queryParams);
      if (res.statusCode == 200 && res.data != null) {
        return (res.data['data'] as List<dynamic>?) ?? [];
      }
    } catch (_) {}
    return [];
  }
}
