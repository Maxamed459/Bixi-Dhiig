import 'dart:async';
import 'dart:convert';

import 'package:get/get.dart';
import 'package:http/http.dart' as http;

import 'constants.dart';
import 'token_storage.dart';

class ApiResponse {
  final bool success;
  final int statusCode;
  final String? message;
  final dynamic data;
  final List<String> errors;

  const ApiResponse({
    required this.success,
    required this.statusCode,
    this.message,
    this.data,
    this.errors = const [],
  });

  /// Best human-readable text for a snackbar.
  String get displayMessage {
    if (errors.isNotEmpty) return errors.join('\n');
    if (message != null && message!.isNotEmpty) return message!;
    return 'error_generic'.tr;
  }
}

/// Mobile is the default client for the backend: no X-Client-Type header, the
/// refresh token travels in the JSON body.
class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  /// Called when a token refresh fails (session is really over).
  void Function()? onSessionExpired;

  Future<bool>? _refreshing;

  Future<ApiResponse> get(String path, {Map<String, String>? query, bool auth = true}) =>
      _send('GET', path, query: query, auth: auth);

  Future<ApiResponse> post(String path, {Object? body, bool auth = true}) =>
      _send('POST', path, body: body, auth: auth);

  Future<ApiResponse> patch(String path, {Object? body, bool auth = true}) =>
      _send('PATCH', path, body: body, auth: auth);

  Uri _uri(String path, Map<String, String>? query) {
    final uri = Uri.parse('${AppConstants.apiBaseUrl}$path');
    if (query == null || query.isEmpty) return uri;
    return uri.replace(queryParameters: query);
  }

  Future<ApiResponse> _send(
    String method,
    String path, {
    Map<String, String>? query,
    Object? body,
    bool auth = true,
    bool retried = false,
  }) async {
    try {
      final headers = <String, String>{
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (auth) {
        final token = await TokenStorage.readAccess();
        if (token != null) headers['Authorization'] = 'Bearer $token';
      }

      final request = http.Request(method, _uri(path, query));
      request.headers.addAll(headers);
      if (body != null) request.body = jsonEncode(body);

      final streamed = await request.send().timeout(const Duration(seconds: 20));
      final res = await http.Response.fromStream(streamed);

      if (res.statusCode == 401 && auth && !retried) {
        final refreshed = await _refreshTokens();
        if (refreshed) {
          return _send(method, path, query: query, body: body, auth: auth, retried: true);
        }
        onSessionExpired?.call();
      }
      return _parse(res);
    } catch (_) {
      return ApiResponse(success: false, statusCode: 0, message: 'network_error'.tr);
    }
  }

  Future<bool> _refreshTokens() {
    return _refreshing ??= _doRefresh().whenComplete(() => _refreshing = null);
  }

  Future<bool> _doRefresh() async {
    try {
      final refresh = await TokenStorage.readRefresh();
      if (refresh == null) return false;

      final res = await http
          .post(
            _uri('/auth/refresh-token', null),
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
            body: jsonEncode({'refreshToken': refresh}),
          )
          .timeout(const Duration(seconds: 20));

      final parsed = _parse(res);
      if (!parsed.success || parsed.data is! Map) return false;

      final data = Map<String, dynamic>.from(parsed.data as Map);
      final access = data['accessToken']?.toString();
      if (access == null) return false;

      await TokenStorage.save(access: access, refresh: data['refreshToken']?.toString());
      return true;
    } catch (_) {
      return false;
    }
  }

  ApiResponse _parse(http.Response res) {
    dynamic decoded;
    try {
      decoded = jsonDecode(utf8.decode(res.bodyBytes));
    } catch (_) {
      decoded = null;
    }

    final ok = res.statusCode >= 200 && res.statusCode < 300;
    if (decoded is! Map) {
      return ApiResponse(success: ok, statusCode: res.statusCode);
    }

    final errors = <String>[];
    final rawErrors = decoded['errors'];
    if (rawErrors is List) {
      for (final e in rawErrors) {
        if (e is Map && e['message'] != null) errors.add(e['message'].toString());
      }
    }

    final msg = decoded['message'];
    return ApiResponse(
      success: ok && decoded['success'] != false,
      statusCode: res.statusCode,
      message: msg is String ? msg : null,
      data: decoded['data'],
      errors: errors,
    );
  }
}
