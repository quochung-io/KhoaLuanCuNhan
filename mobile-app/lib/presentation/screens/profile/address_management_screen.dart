import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../data/api_service.dart';

class AddressManagementScreen extends StatefulWidget {
  final int userId;
  final bool isSelecting; // Nếu true, khi tap vào địa chỉ sẽ pop về trang Checkout
  final Map<String, dynamic>? selectedAddress;

  const AddressManagementScreen({
    Key? key,
    required this.userId,
    this.isSelecting = false,
    this.selectedAddress,
  }) : super(key: key);

  @override
  State<AddressManagementScreen> createState() => _AddressManagementScreenState();
}

class _AddressManagementScreenState extends State<AddressManagementScreen> {
  List<dynamic> _addresses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAddresses();
  }

  Future<void> _fetchAddresses() async {
    setState(() => _isLoading = true);
    try {
      final addresses = await ApiService.getAddresses(widget.userId);
      setState(() {
        _addresses = addresses;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi tải danh sách địa chỉ')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _navigateToAddAddress() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddAddressScreen(
          userId: widget.userId,
          isFirstAddress: _addresses.isEmpty,
        ),
      ),
    );
    if (result == true) {
      _fetchAddresses();
    }
  }

  void _onAddressTap(Map<String, dynamic> address) {
    if (widget.isSelecting) {
      Navigator.pop(context, address);
    }
  }

  // Giả lập set default (Vì API backend có thể chưa hỗ trợ set isDefault, ta tạm mock UI)
  void _setAsDefault(int index) {
    setState(() {
      for (var i = 0; i < _addresses.length; i++) {
        _addresses[i]['isDefault'] = (i == index);
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đã đặt làm địa chỉ mặc định')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: Text(widget.isSelecting ? 'Chọn địa chỉ giao hàng' : 'Sổ địa chỉ'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF2E7D32)))
          : _addresses.isEmpty
              ? const Center(child: Text('Bạn chưa có địa chỉ nào.'))
              : _buildAddressList(),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton.icon(
            onPressed: _navigateToAddAddress,
            icon: const Icon(Icons.add),
            label: const Text('Thêm địa chỉ mới'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2E7D32),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAddressList() {
    Map<String, dynamic>? defaultAddress;
    List<dynamic> alternativeAddresses = [];

    if (_addresses.isNotEmpty) {
      final defIndex = _addresses.indexWhere((a) => a['isDefault'] == true);
      if (defIndex != -1) {
        defaultAddress = _addresses[defIndex];
        alternativeAddresses = List.from(_addresses)..removeAt(defIndex);
      } else {
        defaultAddress = _addresses[0];
        alternativeAddresses = List.from(_addresses)..removeAt(0);
      }
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (defaultAddress != null) ...[
          const Text('ĐỊA CHỈ MẶC ĐỊNH', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey, fontSize: 13)),
          const SizedBox(height: 8),
          _buildAddressItem(defaultAddress, isDefault: true, index: _addresses.indexOf(defaultAddress)),
          const SizedBox(height: 16),
        ],
        if (alternativeAddresses.isNotEmpty) ...[
          const Text('ĐỊA CHỈ THAY THẾ', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey, fontSize: 13)),
          const SizedBox(height: 8),
          ...alternativeAddresses.map((addr) => _buildAddressItem(addr, isDefault: false, index: _addresses.indexOf(addr))),
        ],
      ],
    );
  }

  Widget _buildAddressItem(Map<String, dynamic> addr, {required bool isDefault, required int index}) {
    final isSelected = widget.isSelecting &&
        widget.selectedAddress != null &&
        widget.selectedAddress!['addressId'] == addr['addressId'];

    return GestureDetector(
      onTap: () => _onAddressTap(addr),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF2E7D32) : const Color(0xFFE1EAE0),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      addr['receiverName'] ?? 'Người nhận',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(width: 8),
                    const Text('|', style: TextStyle(color: Colors.grey)),
                    const SizedBox(width: 8),
                    Text(
                      addr['phone'] ?? '',
                      style: const TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
                if (widget.isSelecting && isSelected)
                  const Icon(Icons.check_circle, color: Color(0xFF2E7D32)),
              ],
            ),
            const SizedBox(height: 8),
            Text('${addr['addressDetail']}, ${addr['ward']}, ${addr['district']}, ${addr['province']}'),
            const SizedBox(height: 12),
            if (!widget.isSelecting)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  isDefault
                      ? Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2E7D32).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('Mặc định', style: TextStyle(color: Color(0xFF2E7D32), fontSize: 12)),
                        )
                      : InkWell(
                          onTap: () => _setAsDefault(index),
                          child: const Text('Thiết lập mặc định', style: TextStyle(color: Color(0xFF2E7D32), fontSize: 12)),
                        ),
                  InkWell(
                    onTap: () {},
                    child: const Text('Sửa', style: TextStyle(color: Colors.blue, fontSize: 12)),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

class AddAddressScreen extends StatefulWidget {
  final int userId;
  final bool isFirstAddress;
  const AddAddressScreen({Key? key, required this.userId, this.isFirstAddress = false}) : super(key: key);

  @override
  State<AddAddressScreen> createState() => _AddAddressScreenState();
}

class _AddAddressScreenState extends State<AddAddressScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _streetCtrl = TextEditingController();
  bool _isSubmitting = false;

  List<dynamic> _provinces = [];
  List<dynamic> _districts = [];
  List<dynamic> _wards = [];

  Map<String, dynamic>? _selectedProvince;
  Map<String, dynamic>? _selectedDistrict;
  Map<String, dynamic>? _selectedWard;

  @override
  void initState() {
    super.initState();
    _fetchProvinces();
  }

  Future<void> _fetchProvinces() async {
    try {
      final res = await http.get(Uri.parse('https://provinces.open-api.vn/api/p/'));
      if (res.statusCode == 200) {
        setState(() {
          _provinces = jsonDecode(utf8.decode(res.bodyBytes));
        });
      }
    } catch (e) {
      debugPrint('Error fetching provinces: $e');
    }
  }

  Future<void> _fetchDistricts(int provinceCode) async {
    setState(() {
      _districts = [];
      _wards = [];
      _selectedDistrict = null;
      _selectedWard = null;
    });
    try {
      final res = await http.get(Uri.parse('https://provinces.open-api.vn/api/p/$provinceCode?depth=2'));
      if (res.statusCode == 200) {
        setState(() {
          final data = jsonDecode(utf8.decode(res.bodyBytes));
          _districts = data['districts'] ?? [];
        });
      }
    } catch (e) {}
  }

  Future<void> _fetchWards(int districtCode) async {
    setState(() {
      _wards = [];
      _selectedWard = null;
    });
    try {
      final res = await http.get(Uri.parse('https://provinces.open-api.vn/api/d/$districtCode?depth=2'));
      if (res.statusCode == 200) {
        setState(() {
          final data = jsonDecode(utf8.decode(res.bodyBytes));
          _wards = data['wards'] ?? [];
        });
      }
    } catch (e) {}
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    try {
      final data = {
        'userId': widget.userId,
        'receiverName': _fullNameCtrl.text,
        'phone': _phoneCtrl.text,
        'addressDetail': _streetCtrl.text,
        'ward': _selectedWard?['name'] ?? '',
        'district': _selectedDistrict?['name'] ?? '',
        'province': _selectedProvince?['name'] ?? '',
        'isDefault': widget.isFirstAddress,
      };
      await ApiService.createAddress(data);
      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Thêm địa chỉ thành công')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thêm địa chỉ mới')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _fullNameCtrl,
                decoration: const InputDecoration(labelText: 'Họ và tên'),
                validator: (v) {
                  if (v == null || v.trim().length < 2) return 'Họ tên phải dài ít nhất 2 ký tự';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneCtrl,
                decoration: const InputDecoration(labelText: 'Số điện thoại'),
                keyboardType: TextInputType.phone,
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Vui lòng nhập số điện thoại';
                  final cleanPhone = v.replaceAll(' ', '').replaceAll('.', '').replaceAll('-', '');
                  if (!RegExp(r'^(0|\+84)[3|5|7|8|9][0-9]{8}$').hasMatch(cleanPhone)) {
                    return 'SĐT không hợp lệ (10 số, đầu 03,05,07,08,09)';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<Map<String, dynamic>>(
                decoration: const InputDecoration(labelText: 'Tỉnh/Thành phố'),
                value: _selectedProvince,
                items: _provinces.map((p) => DropdownMenuItem<Map<String, dynamic>>(
                  value: p,
                  child: Text(p['name'], overflow: TextOverflow.ellipsis),
                )).toList(),
                onChanged: (val) {
                  setState(() => _selectedProvince = val);
                  if (val != null) _fetchDistricts(val['code']);
                },
                validator: (v) => v == null ? 'Vui lòng chọn Tỉnh/Thành phố' : null,
                isExpanded: true,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<Map<String, dynamic>>(
                decoration: const InputDecoration(labelText: 'Quận/Huyện'),
                value: _selectedDistrict,
                items: _districts.map((d) => DropdownMenuItem<Map<String, dynamic>>(
                  value: d,
                  child: Text(d['name'], overflow: TextOverflow.ellipsis),
                )).toList(),
                onChanged: (val) {
                  setState(() => _selectedDistrict = val);
                  if (val != null) _fetchWards(val['code']);
                },
                validator: (v) => v == null ? 'Vui lòng chọn Quận/Huyện' : null,
                isExpanded: true,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<Map<String, dynamic>>(
                decoration: const InputDecoration(labelText: 'Phường/Xã'),
                value: _selectedWard,
                items: _wards.map((w) => DropdownMenuItem<Map<String, dynamic>>(
                  value: w,
                  child: Text(w['name'], overflow: TextOverflow.ellipsis),
                )).toList(),
                onChanged: (val) {
                  setState(() => _selectedWard = val);
                },
                validator: (v) => v == null ? 'Vui lòng chọn Phường/Xã' : null,
                isExpanded: true,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _streetCtrl,
                decoration: const InputDecoration(labelText: 'Tên đường, Tòa nhà, Số nhà'),
                validator: (v) => v == null || v.trim().isEmpty ? 'Vui lòng nhập địa chỉ cụ thể' : null,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white))
                      : const Text('Hoàn thành'),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
