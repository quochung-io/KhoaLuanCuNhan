import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class BankInfo {
  final String code;
  final String shortName;
  final String fullName;
  final String bin; // Mã BIN ngân hàng chuẩn Napas
  final String appScheme; // URL Scheme mở app
  final String logoUrl; // Logo chính thức từ VietQR

  const BankInfo({
    required this.code,
    required this.shortName,
    required this.fullName,
    required this.bin,
    this.appScheme = '',
    this.logoUrl = '',
  });

  Map<String, dynamic> toJson() => {
    'code': code,
    'shortName': shortName,
    'fullName': fullName,
    'bin': bin,
    'appScheme': appScheme,
    'logoUrl': logoUrl,
  };

  factory BankInfo.fromJson(Map<String, dynamic> json) => BankInfo(
    code: json['code']?.toString() ?? '',
    shortName: json['shortName']?.toString() ?? json['short_name']?.toString() ?? '',
    fullName: json['fullName']?.toString() ?? json['name']?.toString() ?? '',
    bin: json['bin']?.toString() ?? '',
    appScheme: json['appScheme']?.toString() ?? '',
    logoUrl: json['logoUrl']?.toString() ?? json['logo']?.toString() ?? '',
  );
}

class LinkedBankAccount {
  final String id;
  final String bankCode;
  final String bankName;
  final String accountNumber;
  final String accountHolder;
  final bool isDefault;
  final String appScheme;
  final String logoUrl;

  LinkedBankAccount({
    required this.id,
    required this.bankCode,
    required this.bankName,
    required this.accountNumber,
    required this.accountHolder,
    this.isDefault = false,
    this.appScheme = '',
    this.logoUrl = '',
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'bankCode': bankCode,
    'bankName': bankName,
    'accountNumber': accountNumber,
    'accountHolder': accountHolder,
    'isDefault': isDefault,
    'appScheme': appScheme,
    'logoUrl': logoUrl,
  };

  factory LinkedBankAccount.fromJson(Map<String, dynamic> json) => LinkedBankAccount(
    id: json['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
    bankCode: json['bankCode']?.toString() ?? 'MB',
    bankName: json['bankName']?.toString() ?? 'MB Bank',
    accountNumber: json['accountNumber']?.toString() ?? '',
    accountHolder: json['accountHolder']?.toString() ?? '',
    isDefault: json['isDefault'] == true,
    appScheme: json['appScheme']?.toString() ?? '',
    logoUrl: json['logoUrl']?.toString() ?? '',
  );
}

class BankService {
  static const String _storageKey = 'user_linked_bank_accounts';
  static const String _cachedBanksKey = 'cached_vietqr_banks_list';

  // Danh sách 9 ngân hàng phổ biến offline mặc định (dùng khi mất mạng và chưa có cache)
  static const List<BankInfo> defaultBanks = [
    BankInfo(code: 'MB', shortName: 'MB Bank', fullName: 'Ngân hàng Quân Đội', bin: '970422', appScheme: 'mbmobile://', logoUrl: 'https://cdn.vietqr.io/img/MB.png'),
    BankInfo(code: 'VCB', shortName: 'Vietcombank', fullName: 'Ngân hàng Ngoại Thương VN', bin: '970436', appScheme: 'vietcombank://', logoUrl: 'https://cdn.vietqr.io/img/VCB.png'),
    BankInfo(code: 'TCB', shortName: 'Techcombank', fullName: 'Ngân hàng Kỹ Thương VN', bin: '970407', appScheme: 'tcb://', logoUrl: 'https://cdn.vietqr.io/img/TCB.png'),
    BankInfo(code: 'TPB', shortName: 'TPBank', fullName: 'Ngân hàng Tiên Phong', bin: '970423', appScheme: 'tpbank://', logoUrl: 'https://cdn.vietqr.io/img/TPB.png'),
    BankInfo(code: 'BIDV', shortName: 'BIDV', fullName: 'Ngân hàng Đầu Tư & Phát Triển VN', bin: '970418', appScheme: 'bidvsmartbanking://', logoUrl: 'https://cdn.vietqr.io/img/BIDV.png'),
    BankInfo(code: 'ACB', shortName: 'ACB', fullName: 'Ngân hàng Á Châu', bin: '970416', appScheme: 'acb://', logoUrl: 'https://cdn.vietqr.io/img/ACB.png'),
    BankInfo(code: 'VPB', shortName: 'VPBank', fullName: 'Ngân hàng Việt Nam Thịnh Vượng', bin: '970432', appScheme: 'vpbankneo://', logoUrl: 'https://cdn.vietqr.io/img/VPB.png'),
    BankInfo(code: 'CTG', shortName: 'VietinBank', fullName: 'Ngân hàng Công Thương VN', bin: '970415', appScheme: 'vietinbankipay://', logoUrl: 'https://cdn.vietqr.io/img/ICB.png'),
    BankInfo(code: 'VBA', shortName: 'Agribank', fullName: 'Ngân hàng Nông Nghiệp & PTNT', bin: '970405', appScheme: 'agribank://', logoUrl: 'https://cdn.vietqr.io/img/VBA.png'),
  ];

  // Gọi API VietQR lấy trọn bộ 65+ ngân hàng tại Việt Nam (có cơ chế Cache và Offline Fallback)
  static Future<List<BankInfo>> fetchAllBanks() async {
    final prefs = await SharedPreferences.getInstance();

    try {
      final response = await http.get(Uri.parse('https://api.vietqr.io/v2/banks')).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        final data = decoded['data'] as List<dynamic>?;

        if (data != null && data.isNotEmpty) {
          final banks = data.map((item) {
            final m = item as Map<String, dynamic>;
            final code = (m['code'] ?? '').toString();
            final shortName = (m['shortName'] ?? m['short_name'] ?? code).toString();
            final name = (m['name'] ?? shortName).toString();
            final bin = (m['bin'] ?? '').toString();
            final logo = (m['logo'] ?? '').toString();

            // Gán scheme nếu có
            String scheme = '';
            switch (code.toUpperCase()) {
              case 'MB':
                scheme = 'mbmobile://';
                break;
              case 'VCB':
                scheme = 'vietcombank://';
                break;
              case 'TCB':
                scheme = 'tcb://';
                break;
              case 'TPB':
                scheme = 'tpbank://';
                break;
              case 'BIDV':
                scheme = 'bidvsmartbanking://';
                break;
              case 'ACB':
                scheme = 'acb://';
                break;
              case 'VPB':
                scheme = 'vpbankneo://';
                break;
              case 'ICB':
              case 'CTG':
                scheme = 'vietinbankipay://';
                break;
              case 'VBA':
                scheme = 'agribank://';
                break;
            }

            return BankInfo(
              code: code,
              shortName: shortName,
              fullName: name,
              bin: bin,
              appScheme: scheme,
              logoUrl: logo,
            );
          }).toList();

          // Lưu cache vào SharedPreferences
          final jsonStr = jsonEncode(banks.map((b) => b.toJson()).toList());
          await prefs.setString(_cachedBanksKey, jsonStr);
          return banks;
        }
      }
    } catch (_) {
      // Mất kết nối mạng hoặc timeout
    }

    // Nếu không gọi được API: Đọc từ Cache trước
    final cachedStr = prefs.getString(_cachedBanksKey);
    if (cachedStr != null && cachedStr.isNotEmpty) {
      try {
        final list = jsonDecode(cachedStr) as List<dynamic>;
        return list.map((m) => BankInfo.fromJson(m as Map<String, dynamic>)).toList();
      } catch (_) {}
    }

    // Cuối cùng: Trả về danh sách mặc định có sẵn (offline an toàn 100%)
    return defaultBanks;
  }

  static List<BankInfo> get supportedBanks => defaultBanks;

  static BankInfo getBankInfo(String code, [List<BankInfo>? bankList]) {
    final list = bankList ?? defaultBanks;
    try {
      return list.firstWhere(
        (b) => b.code.toUpperCase() == code.toUpperCase(),
        orElse: () => defaultBanks.firstWhere(
          (b) => b.code.toUpperCase() == code.toUpperCase(),
          orElse: () => BankInfo(
            code: code,
            shortName: code,
            fullName: code,
            bin: '',
            logoUrl: 'https://cdn.vietqr.io/img/$code.png',
          ),
        ),
      );
    } catch (_) {
      return defaultBanks.first;
    }
  }

  // Lấy danh sách tài khoản ngân hàng đã liên kết
  static Future<List<LinkedBankAccount>> getLinkedAccounts() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final listStr = prefs.getStringList(_storageKey) ?? [];
      return listStr.map((s) => LinkedBankAccount.fromJson(jsonDecode(s) as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  // Thêm tài khoản mới (Hỗ trợ nhiều tài khoản)
  static Future<bool> addAccount(LinkedBankAccount account) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final accounts = await getLinkedAccounts();

      final isFirst = accounts.isEmpty;
      final newAcc = LinkedBankAccount(
        id: account.id,
        bankCode: account.bankCode,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountHolder: account.accountHolder.toUpperCase(),
        isDefault: isFirst || account.isDefault,
        appScheme: account.appScheme,
        logoUrl: account.logoUrl,
      );

      if (newAcc.isDefault) {
        for (int i = 0; i < accounts.length; i++) {
          accounts[i] = LinkedBankAccount(
            id: accounts[i].id,
            bankCode: accounts[i].bankCode,
            bankName: accounts[i].bankName,
            accountNumber: accounts[i].accountNumber,
            accountHolder: accounts[i].accountHolder,
            isDefault: false,
            appScheme: accounts[i].appScheme,
            logoUrl: accounts[i].logoUrl,
          );
        }
      }

      accounts.add(newAcc);
      final rawList = accounts.map((a) => jsonEncode(a.toJson())).toList();
      return await prefs.setStringList(_storageKey, rawList);
    } catch (_) {
      return false;
    }
  }

  // Đặt tài khoản làm mặc định
  static Future<bool> setDefaultAccount(String id) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final accounts = await getLinkedAccounts();
      for (int i = 0; i < accounts.length; i++) {
        final isMatch = accounts[i].id == id;
        accounts[i] = LinkedBankAccount(
          id: accounts[i].id,
          bankCode: accounts[i].bankCode,
          bankName: accounts[i].bankName,
          accountNumber: accounts[i].accountNumber,
          accountHolder: accounts[i].accountHolder,
          isDefault: isMatch,
          appScheme: accounts[i].appScheme,
          logoUrl: accounts[i].logoUrl,
        );
      }
      final rawList = accounts.map((a) => jsonEncode(a.toJson())).toList();
      return await prefs.setStringList(_storageKey, rawList);
    } catch (_) {
      return false;
    }
  }

  // Xóa tài khoản liên kết
  static Future<bool> removeAccount(String id) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final accounts = await getLinkedAccounts();
      final targetIdx = accounts.indexWhere((a) => a.id == id);
      if (targetIdx >= 0) {
        final wasDefault = accounts[targetIdx].isDefault;
        accounts.removeAt(targetIdx);
        if (wasDefault && accounts.isNotEmpty) {
          accounts[0] = LinkedBankAccount(
            id: accounts[0].id,
            bankCode: accounts[0].bankCode,
            bankName: accounts[0].bankName,
            accountNumber: accounts[0].accountNumber,
            accountHolder: accounts[0].accountHolder,
            isDefault: true,
            appScheme: accounts[0].appScheme,
            logoUrl: accounts[0].logoUrl,
          );
        }
        final rawList = accounts.map((a) => jsonEncode(a.toJson())).toList();
        return await prefs.setStringList(_storageKey, rawList);
      }
      return true;
    } catch (_) {
      return false;
    }
  }
}
