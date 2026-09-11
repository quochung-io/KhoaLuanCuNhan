import 'package:flutter/material.dart';

class ScanningLineAnimation extends StatefulWidget {
  const ScanningLineAnimation({super.key});

  @override
  State<ScanningLineAnimation> createState() => _ScanningLineAnimationState();
}

class _ScanningLineAnimationState extends State<ScanningLineAnimation> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.0, end: 236.0).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Positioned(
          top: _animation.value,
          left: 2,
          right: 2,
          child: Container(
            height: 3,
            decoration: BoxDecoration(
              color: const Color(0xFF4CAF50),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF4CAF50).withValues(alpha: 0.8),
                  blurRadius: 8,
                  spreadRadius: 2,
                )
              ],
            ),
          ),
        );
      },
    );
  }
}
