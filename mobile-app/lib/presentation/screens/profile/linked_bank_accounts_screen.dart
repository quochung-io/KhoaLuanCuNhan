import 'package:flutter/material.dart';
import '../../../core/utils/bank_service.dart';

class LinkedBankAccountsScreen extends StatefulWidget {
  final bool
  selectMode; // Nếu true, bấm vào thẻ sẽ pop về và trả về thẻ được chọn
  const LinkedBankAccountsScreen({super.key, this.selectMode = false});

  @override
  State<LinkedBankAccountsScreen> createState() =>
      _LinkedBankAccountsScreenState();
}

class _LinkedBankAccountsScreenState extends State<LinkedBankAccountsScreen> {
  List<LinkedBankAccount> _accounts = [];
  List<BankInfo> _allBanks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAccounts();
    _loadAllBanks();
  }

  Future<void> _loadAccounts() async {
    final list = await BankService.getLinkedAccounts();
    if (mounted) {
      setState(() {
        _accounts = list;
        _isLoading = false;
      });
    }
  }

  Future<void> _loadAllBanks() async {
    final banks = await BankService.fetchAllBanks();
    if (mounted) {
      setState(() {
        _allBanks = banks;
      });
    }
  }

  Color _getBankColor(String bankCode) {
    switch (bankCode.toUpperCase()) {
      case 'MB':
        return const Color(0xFF1B3A82); // Xanh navy Quân Đội
      case 'VCB':
        return const Color(0xFF005B38); // Xanh lá Vietcombank
      case 'TCB':
        return const Color(0xFFCC1F28); // Đỏ Techcombank
      case 'TPB':
        return const Color(0xFF6A1B9A); // Tím TPBank
      case 'BIDV':
        return const Color(0xFF00558F); // Xanh dương BIDV
      case 'ACB':
        return const Color(0xFF0D47A1); // Xanh ACB
      case 'VPB':
        return const Color(0xFF008848); // Xanh lá VPBank
      case 'CTG':
      case 'ICB':
        return const Color(0xFF00509D); // Xanh VietinBank
      case 'VBA':
        return const Color(0xFF8B181B); // Đỏ sẫm Agribank
      default:
        return const Color(0xFF2E7D32);
    }
  }

  void _openBankSelector(BuildContext context, Function(BankInfo) onSelect) {
    final bankList = _allBanks.isNotEmpty
        ? _allBanks
        : BankService.defaultBanks;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        String searchQuery = '';

        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            final filtered = bankList.where((b) {
              final q = searchQuery.toLowerCase();
              return b.code.toLowerCase().contains(q) ||
                  b.shortName.toLowerCase().contains(q) ||
                  b.fullName.toLowerCase().contains(q);
            }).toList();

            return Container(
              height: MediaQuery.of(ctx).size.height * 0.78,
              padding: const EdgeInsets.only(top: 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.account_balance,
                              color: Color(0xFF2E7D32),
                              size: 22,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Chọn ngân hàng (${bankList.length})',
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1B3A20),
                              ),
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(
                            Icons.close,
                            size: 20,
                            color: Colors.grey,
                          ),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Tìm theo tên, mã (VCB, MB, Techcombank...)',
                        hintStyle: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade400,
                        ),
                        prefixIcon: const Icon(
                          Icons.search,
                          color: Color(0xFF2E7D32),
                        ),
                        filled: true,
                        fillColor: const Color(0xFFF7FAF7),
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: 10,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFFE1EAE0),
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFFE1EAE0),
                          ),
                        ),
                      ),
                      onChanged: (val) {
                        setModalState(() {
                          searchQuery = val;
                        });
                      },
                    ),
                  ),
                  const SizedBox(height: 10),
                  Expanded(
                    child: filtered.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.search_off,
                                  size: 48,
                                  color: Colors.grey.shade300,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Không tìm thấy ngân hàng phù hợp',
                                  style: TextStyle(color: Colors.grey.shade500),
                                ),
                              ],
                            ),
                          )
                        : ListView.separated(
                            itemCount: filtered.length,
                            separatorBuilder: (_, __) =>
                                Divider(height: 1, color: Colors.grey.shade100),
                            itemBuilder: (c, i) {
                              final bank = filtered[i];
                              return ListTile(
                                leading: Container(
                                  width: 44,
                                  height: 44,
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: Colors.grey.shade200,
                                    ),
                                  ),
                                  child: bank.logoUrl.isNotEmpty
                                      ? Image.network(
                                          bank.logoUrl,
                                          fit: BoxFit.contain,
                                          errorBuilder: (_, __, ___) => Center(
                                            child: Text(
                                              bank.code.length > 4
                                                  ? bank.code.substring(0, 4)
                                                  : bank.code,
                                              style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                color: _getBankColor(bank.code),
                                              ),
                                            ),
                                          ),
                                        )
                                      : Center(
                                          child: Text(
                                            bank.code.length > 4
                                                ? bank.code.substring(0, 4)
                                                : bank.code,
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: _getBankColor(bank.code),
                                            ),
                                          ),
                                        ),
                                ),
                                title: Text(
                                  bank.shortName,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                                subtitle: Text(
                                  bank.fullName,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade600,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                onTap: () {
                                  Navigator.pop(ctx);
                                  onSelect(bank);
                                },
                              );
                            },
                          ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showAddAccountSheet() {
    BankInfo selectedBank = _allBanks.isNotEmpty
        ? _allBanks.first
        : BankService.defaultBanks.first;
    final accountNumCtrl = TextEditingController();
    final accountHolderCtrl = TextEditingController();
    bool setAsDefault = _accounts.isEmpty;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (sheetCtx, setSheetState) {
          return Container(
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 20,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Row(
                    children: [
                      Icon(
                        Icons.account_balance,
                        color: Color(0xFF2E7D32),
                        size: 24,
                      ),
                      SizedBox(width: 8),
                      Text(
                        'Liên kết tài khoản ngân hàng',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1B3A20),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Dùng để thanh toán 1 chạm qua ứng dụng ngân hàng khi mua sắm nông sản.',
                    style: TextStyle(
                      fontSize: 12.5,
                      color: Colors.grey.shade600,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Chọn Ngân hàng
                  const Text(
                    'NGÂN HÀNG',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF8D9E90),
                    ),
                  ),
                  const SizedBox(height: 8),
                  InkWell(
                    onTap: () {
                      _openBankSelector(context, (chosen) {
                        setSheetState(() => selectedBank = chosen);
                      });
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF7FAF7),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE1EAE0)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.grey.shade200),
                            ),
                            child: selectedBank.logoUrl.isNotEmpty
                                ? Image.network(
                                    selectedBank.logoUrl,
                                    fit: BoxFit.contain,
                                    errorBuilder: (_, __, ___) => Center(
                                      child: Text(
                                        selectedBank.code.length > 4
                                            ? selectedBank.code.substring(0, 4)
                                            : selectedBank.code,
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: _getBankColor(
                                            selectedBank.code,
                                          ),
                                        ),
                                      ),
                                    ),
                                  )
                                : Center(
                                    child: Text(
                                      selectedBank.code.length > 4
                                          ? selectedBank.code.substring(0, 4)
                                          : selectedBank.code,
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: _getBankColor(selectedBank.code),
                                      ),
                                    ),
                                  ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  selectedBank.shortName,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1B3A20),
                                  ),
                                ),
                                Text(
                                  selectedBank.fullName,
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    color: Colors.grey.shade600,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          const Icon(
                            Icons.keyboard_arrow_down,
                            color: Color(0xFF2E7D32),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Số tài khoản
                  const Text(
                    'SỐ TÀI KHOẢN NGÂN HÀNG',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF8D9E90),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: accountNumCtrl,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      hintText: 'Nhập số tài khoản (ví dụ: 0359781682)',
                      prefixIcon: const Icon(
                        Icons.credit_card_outlined,
                        color: Color(0xFF2E7D32),
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF7FAF7),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE1EAE0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE1EAE0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF2E7D32)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Tên chủ tài khoản
                  const Text(
                    'TÊN CHỦ TÀI KHOẢN (IN HOA)',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF8D9E90),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: accountHolderCtrl,
                    textCapitalization: TextCapitalization.characters,
                    decoration: InputDecoration(
                      hintText: 'Nhập họ tên (ví dụ: BUI QUOC HUNG)',
                      prefixIcon: const Icon(
                        Icons.person_outline,
                        color: Color(0xFF2E7D32),
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF7FAF7),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE1EAE0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE1EAE0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF2E7D32)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Đặt làm mặc định
                  Row(
                    children: [
                      Checkbox(
                        value: setAsDefault,
                        activeColor: const Color(0xFF2E7D32),
                        onChanged: (val) =>
                            setSheetState(() => setAsDefault = val ?? false),
                      ),
                      const Text(
                        'Đặt làm tài khoản thanh toán mặc định',
                        style: TextStyle(fontSize: 13),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Nút Lưu
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () async {
                        final accNum = accountNumCtrl.text.trim();
                        final accHolder = accountHolderCtrl.text.trim();

                        if (accNum.isEmpty || accHolder.isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Vui lòng nhập đầy đủ Số tài khoản và Tên chủ thẻ!',
                              ),
                              backgroundColor: Colors.red,
                            ),
                          );
                          return;
                        }

                        final newAccount = LinkedBankAccount(
                          id: DateTime.now().millisecondsSinceEpoch.toString(),
                          bankCode: selectedBank.code,
                          bankName: selectedBank.shortName,
                          accountNumber: accNum,
                          accountHolder: accHolder.toUpperCase(),
                          isDefault: setAsDefault,
                          appScheme: selectedBank.appScheme,
                          logoUrl: selectedBank.logoUrl,
                        );

                        await BankService.addAccount(newAccount);
                        if (!mounted) return;
                        Navigator.pop(ctx);
                        _loadAccounts();
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              'Đã liên kết thành công tài khoản ${selectedBank.shortName}!',
                            ),
                            backgroundColor: const Color(0xFF2E7D32),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2E7D32),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Xác nhận liên kết',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _confirmDelete(LinkedBankAccount acc) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'Xác nhận xóa tài khoản',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Bạn có chắc muốn hủy liên kết tài khoản ${acc.bankName} (${acc.accountNumber})?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await BankService.removeAccount(acc.id);
              _loadAccounts();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Đã hủy liên kết tài khoản')),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Xóa liên kết'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: const Text(
          'Tài Khoản Ngân Hàng',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
            )
          : _accounts.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: const BoxDecoration(
                        color: Color(0xFFE8F5E9),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.account_balance_wallet_outlined,
                        size: 40,
                        color: Color(0xFF2E7D32),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Chưa liên kết tài khoản nào',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Color(0xFF1B3A20),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Liên kết tài khoản ngân hàng của bạn để thanh toán đơn hàng nông sản 1 chạm nhanh chóng.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey.shade600,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _showAddAccountSheet,
                      icon: const Icon(Icons.add, color: Colors.white),
                      label: const Text(
                        'Liên kết ngân hàng ngay',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2E7D32),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ],
                ),
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                ..._accounts.map((acc) => _buildCardTile(acc)),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  onPressed: _showAddAccountSheet,
                  icon: const Icon(
                    Icons.add_circle_outline,
                    color: Color(0xFF2E7D32),
                  ),
                  label: const Text(
                    'Thêm tài khoản ngân hàng khác',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF2E7D32),
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(
                      color: Color(0xFF2E7D32),
                      width: 1.2,
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    backgroundColor: Colors.white,
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildCardTile(LinkedBankAccount acc) {
    final cardColor = _getBankColor(acc.bankCode);

    return GestureDetector(
      onTap: () {
        if (widget.selectMode) {
          Navigator.pop(context, acc);
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        height: 175,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            colors: [cardColor, cardColor.withValues(alpha: 0.8)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: cardColor.withValues(alpha: 0.35),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Hoa văn vòng tròn nền
            Positioned(
              right: -30,
              top: -30,
              child: Container(
                width: 130,
                height: 130,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.1),
                ),
              ),
            ),
            Positioned(
              right: 40,
              bottom: -40,
              child: Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.08),
                ),
              ),
            ),

            // Nội dung Thẻ
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          if (acc.logoUrl.isNotEmpty)
                            Container(
                              height: 28,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              margin: const EdgeInsets.only(right: 8),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Image.network(
                                acc.logoUrl,
                                height: 22,
                                fit: BoxFit.contain,
                                errorBuilder: (_, __, ___) => const Icon(
                                  Icons.credit_card,
                                  color: Colors.grey,
                                  size: 18,
                                ),
                              ),
                            )
                          else
                            const Padding(
                              padding: EdgeInsets.only(right: 8),
                              child: Icon(
                                Icons.credit_card,
                                color: Colors.white,
                                size: 24,
                              ),
                            ),
                          Text(
                            acc.bankName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      if (acc.isDefault)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.25),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.5),
                            ),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.check, size: 12, color: Colors.white),
                              SizedBox(width: 4),
                              Text(
                                'Mặc định',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        )
                      else if (!widget.selectMode)
                        PopupMenuButton<String>(
                          icon: const Icon(
                            Icons.more_vert,
                            color: Colors.white,
                          ),
                          onSelected: (val) async {
                            if (val == 'default') {
                              await BankService.setDefaultAccount(acc.id);
                              _loadAccounts();
                            } else if (val == 'delete') {
                              _confirmDelete(acc);
                            }
                          },
                          itemBuilder: (c) => [
                            const PopupMenuItem(
                              value: 'default',
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.check_circle_outline,
                                    color: Color(0xFF2E7D32),
                                    size: 18,
                                  ),
                                  SizedBox(width: 8),
                                  Text('Đặt làm mặc định'),
                                ],
                              ),
                            ),
                            const PopupMenuItem(
                              value: 'delete',
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.delete_outline,
                                    color: Colors.red,
                                    size: 18,
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    'Xóa liên kết',
                                    style: TextStyle(color: Colors.red),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),

                  // Số tài khoản
                  Text(
                    acc.accountNumber.replaceAllMapped(
                      RegExp(r".{4}"),
                      (match) => "${match.group(0)} ",
                    ),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2.5,
                      fontFamily: 'monospace',
                    ),
                  ),

                  // Tên chủ thẻ
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'CHỦ TÀI KHOẢN',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.7),
                              fontSize: 9.5,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            acc.accountHolder,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const Icon(Icons.nfc, color: Colors.white70, size: 24),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
