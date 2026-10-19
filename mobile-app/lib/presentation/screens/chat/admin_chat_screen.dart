import 'package:flutter/material.dart';
import '../../../core/localization_service.dart';

class AdminChatScreen extends StatefulWidget {
  final int? currentUserId;
  final String? currentUserName;

  const AdminChatScreen({super.key, this.currentUserId, this.currentUserName});

  @override
  State<AdminChatScreen> createState() => _AdminChatScreenState();
}

class _AdminChatScreenState extends State<AdminChatScreen> {
  final TextEditingController _msgCtrl = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  String _selectedTopic = 'Chất lượng nông sản';
  final List<String> _topics = [
    'Chất lượng nông sản',
    'Giao trễ / Thiếu hàng',
    'Yêu cầu hoàn tiền',
    'Tư vấn gói combo',
    'Vấn đề khác',
  ];

  final List<Map<String, dynamic>> _messages = [
    {
      'sender': 'admin',
      'text':
          'Chào bạn! Đây là kênh tiếp nhận và giải quyết trực tiếp của Ban Quản Trị Hệ Thống LÀNH.',
      'time': 'Vừa xong',
    },
    {
      'sender': 'admin',
      'text':
          'Admin sẽ trực tiếp làm việc và xử lý nghiêm ngặt với các Nhà cung cấp / Hợp tác xã liên quan để bảo vệ tối đa quyền lợi của bạn. Bạn vui lòng chọn chủ đề và gửi mô tả vấn đề nhé!',
      'time': 'Vừa xong',
    },
  ];

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({
        'sender': 'user',
        'text': '[$_selectedTopic] $text',
        'time': 'Bây giờ',
      });
      _msgCtrl.clear();
    });

    _scrollToBottom();

    // Phản hồi tự động của Admin
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          _messages.add({
            'sender': 'admin',
            'text':
                'Admin đã tiếp nhận phản hồi về "$_selectedTopic". Đội ngũ Kiểm Soát Chất Lượng của LÀNH đang liên hệ ngay với Hợp tác xã cung cấp để xác minh lô hàng và sẽ phản hồi phương án xử lý (đổi hàng mới hoặc hoàn tiền) cho bạn trong ít phút!',
            'time': 'Bây giờ',
          });
        });
        _scrollToBottom();
      }
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isEn = LocalizationService.instance.isEnglish;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            Stack(
              children: [
                const CircleAvatar(
                  radius: 18,
                  backgroundColor: Color(0xFF1B5E20),
                  child: Icon(
                    Icons.shield_outlined,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isEn ? 'Admin Support Desk' : 'Ban Quản Trị Hệ Thống LÀNH',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14.5,
                    color: Color(0xFF1B3A20),
                  ),
                ),
                Text(
                  isEn
                      ? 'Direct consumer protection'
                      : 'Bảo vệ quyền lợi người tiêu dùng',
                  style: const TextStyle(
                    fontSize: 10.5,
                    color: Color(0xFF2E7D32),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Thanh chọn chủ đề khiếu nại
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                const Text(
                  'Chủ đề: ',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1B3A20),
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _topics.map((t) {
                        final isSel = _selectedTopic == t;
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ChoiceChip(
                            label: Text(t),
                            selected: isSel,
                            selectedColor: const Color(0xFFE8F5E9),
                            backgroundColor: const Color(0xFFF5F7F5),
                            labelStyle: TextStyle(
                              fontSize: 11,
                              fontWeight: isSel
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                              color: isSel
                                  ? const Color(0xFF1B5E20)
                                  : Colors.black87,
                            ),
                            onSelected: (val) {
                              if (val) setState(() => _selectedTopic = t);
                            },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Danh sách tin nhắn
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isAdmin = msg['sender'] == 'admin';

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    mainAxisAlignment: isAdmin
                        ? MainAxisAlignment.start
                        : MainAxisAlignment.end,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (isAdmin) ...[
                        const CircleAvatar(
                          radius: 14,
                          backgroundColor: Color(0xFF1B5E20),
                          child: Icon(
                            Icons.security,
                            size: 14,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      Flexible(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            color: isAdmin
                                ? Colors.white
                                : const Color(0xFF2E7D32),
                            borderRadius: BorderRadius.circular(16).copyWith(
                              topLeft: isAdmin
                                  ? Radius.zero
                                  : const Radius.circular(16),
                              topRight: !isAdmin
                                  ? Radius.zero
                                  : const Radius.circular(16),
                            ),
                            border: isAdmin
                                ? Border.all(color: const Color(0xFFE1EAE0))
                                : null,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.03),
                                blurRadius: 4,
                                offset: const Offset(0, 1),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: isAdmin
                                ? CrossAxisAlignment.start
                                : CrossAxisAlignment.end,
                            children: [
                              Text(
                                msg['text'] ?? '',
                                style: TextStyle(
                                  color: isAdmin
                                      ? const Color(0xFF1B3A20)
                                      : Colors.white,
                                  fontSize: 13,
                                  height: 1.35,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                msg['time'] ?? '',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: isAdmin ? Colors.grey : Colors.white70,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      if (!isAdmin) const SizedBox(width: 8),
                    ],
                  ),
                );
              },
            ),
          ),

          // Thanh nhập tin nhắn
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _msgCtrl,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                      decoration: InputDecoration(
                        hintText: 'Nhập nội dung gửi Ban Quản Trị...',
                        hintStyle: const TextStyle(
                          fontSize: 13,
                          color: Colors.grey,
                        ),
                        filled: true,
                        fillColor: const Color(0xFFF7FAF7),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: const BorderSide(
                            color: Color(0xFFE1EAE0),
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: const BorderSide(
                            color: Color(0xFFE1EAE0),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: const Color(0xFF2E7D32),
                    child: IconButton(
                      icon: const Icon(
                        Icons.send,
                        color: Colors.white,
                        size: 18,
                      ),
                      onPressed: _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
