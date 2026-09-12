// TU DONG SINH TU BACKEND OPENAPI SCHEMA - KHONG CHINH SUA BANG TAY
// Generated at: 2026-09-12T19:14:04.389Z

class Address {
  final int? addressId;
  final int? userId;
  final String? receiverName;
  final String? phone;
  final String? province;
  final String? district;
  final String? ward;
  final String? addressDetail;
  final double? latitude;
  final double? longitude;
  final bool? isDefault;
  final String? addressType;

  Address({
    this.addressId,
    this.userId,
    this.receiverName,
    this.phone,
    this.province,
    this.district,
    this.ward,
    this.addressDetail,
    this.latitude,
    this.longitude,
    this.isDefault,
    this.addressType,
  });

  factory Address.fromJson(Map<String, dynamic> json) => Address(
    addressId: json['addressId'],
    userId: json['userId'],
    receiverName: json['receiverName'],
    phone: json['phone'],
    province: json['province'],
    district: json['district'],
    ward: json['ward'],
    addressDetail: json['addressDetail'],
    latitude: json['latitude'],
    longitude: json['longitude'],
    isDefault: json['isDefault'],
    addressType: json['addressType'],
  );

  Map<String, dynamic> toJson() => {
    'addressId': addressId,
    'userId': userId,
    'receiverName': receiverName,
    'phone': phone,
    'province': province,
    'district': district,
    'ward': ward,
    'addressDetail': addressDetail,
    'latitude': latitude,
    'longitude': longitude,
    'isDefault': isDefault,
    'addressType': addressType,
  };
}

class Category {
  final int? categoryId;
  final String? categoryName;
  final int? parentCategoryId;
  final String? status;

  Category({
    this.categoryId,
    this.categoryName,
    this.parentCategoryId,
    this.status,
  });

  factory Category.fromJson(Map<String, dynamic> json) => Category(
    categoryId: json['categoryId'],
    categoryName: json['categoryName'],
    parentCategoryId: json['parentCategoryId'],
    status: json['status'],
  );

  Map<String, dynamic> toJson() => {
    'categoryId': categoryId,
    'categoryName': categoryName,
    'parentCategoryId': parentCategoryId,
    'status': status,
  };
}

class CreateReviewRequest {
  final int? productId;
  final int? customerId;
  final String? customerName;
  final String? email;
  final int? orderId;
  final int? rating;
  final String? comment;
  final List<String>? imageUrls;

  CreateReviewRequest({
    this.productId,
    this.customerId,
    this.customerName,
    this.email,
    this.orderId,
    this.rating,
    this.comment,
    this.imageUrls,
  });

  factory CreateReviewRequest.fromJson(Map<String, dynamic> json) => CreateReviewRequest(
    productId: json['productId'],
    customerId: json['customerId'],
    customerName: json['customerName'],
    email: json['email'],
    orderId: json['orderId'],
    rating: json['rating'],
    comment: json['comment'],
    imageUrls: json['imageUrls'],
  );

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'customerId': customerId,
    'customerName': customerName,
    'email': email,
    'orderId': orderId,
    'rating': rating,
    'comment': comment,
    'imageUrls': imageUrls,
  };
}

class ForgotPasswordRequest {
  final String? email;

  ForgotPasswordRequest({
    this.email,
  });

  factory ForgotPasswordRequest.fromJson(Map<String, dynamic> json) => ForgotPasswordRequest(
    email: json['email'],
  );

  Map<String, dynamic> toJson() => {
    'email': email,
  };
}

class HelpfulVoteRequest {
  final int? userId;

  HelpfulVoteRequest({
    this.userId,
  });

  factory HelpfulVoteRequest.fromJson(Map<String, dynamic> json) => HelpfulVoteRequest(
    userId: json['userId'],
  );

  Map<String, dynamic> toJson() => {
    'userId': userId,
  };
}

class LoginDto {
  final String? username;
  final String? password;

  LoginDto({
    this.username,
    this.password,
  });

  factory LoginDto.fromJson(Map<String, dynamic> json) => LoginDto(
    username: json['username'],
    password: json['password'],
  );

  Map<String, dynamic> toJson() => {
    'username': username,
    'password': password,
  };
}

class LoginRequest {
  final String? email;
  final String? password;

  LoginRequest({
    this.email,
    this.password,
  });

  factory LoginRequest.fromJson(Map<String, dynamic> json) => LoginRequest(
    email: json['email'],
    password: json['password'],
  );

  Map<String, dynamic> toJson() => {
    'email': email,
    'password': password,
  };
}

class Order {
  final int? orderId;
  final int? customerId;
  final String? orderCode;
  final int? addressId;
  final double? subtotal;
  final double? discountAmount;
  final double? shippingFee;
  final double? totalAmount;
  final String? paymentMethod;
  final String? paymentStatus;
  final String? orderStatus;
  final String? createdAt;
  final String? updatedAt;
  final User? customer;
  final Address? address;
  final List<OrderItem>? orderItems;

  Order({
    this.orderId,
    this.customerId,
    this.orderCode,
    this.addressId,
    this.subtotal,
    this.discountAmount,
    this.shippingFee,
    this.totalAmount,
    this.paymentMethod,
    this.paymentStatus,
    this.orderStatus,
    this.createdAt,
    this.updatedAt,
    this.customer,
    this.address,
    this.orderItems,
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
    orderId: json['orderId'],
    customerId: json['customerId'],
    orderCode: json['orderCode'],
    addressId: json['addressId'],
    subtotal: json['subtotal'],
    discountAmount: json['discountAmount'],
    shippingFee: json['shippingFee'],
    totalAmount: json['totalAmount'],
    paymentMethod: json['paymentMethod'],
    paymentStatus: json['paymentStatus'],
    orderStatus: json['orderStatus'],
    createdAt: json['createdAt'],
    updatedAt: json['updatedAt'],
    customer: json['customer'],
    address: json['address'],
    orderItems: json['orderItems'],
  );

  Map<String, dynamic> toJson() => {
    'orderId': orderId,
    'customerId': customerId,
    'orderCode': orderCode,
    'addressId': addressId,
    'subtotal': subtotal,
    'discountAmount': discountAmount,
    'shippingFee': shippingFee,
    'totalAmount': totalAmount,
    'paymentMethod': paymentMethod,
    'paymentStatus': paymentStatus,
    'orderStatus': orderStatus,
    'createdAt': createdAt,
    'updatedAt': updatedAt,
    'customer': customer,
    'address': address,
    'orderItems': orderItems,
  };
}

class OrderCreateDto {
  final int? customerId;
  final double? subtotal;
  final double? discountAmount;
  final double? shippingFee;
  final String? paymentMethod;
  final List<OrderItemDto>? orderItems;
  final int? addressId;
  final String? receiverName;
  final String? phone;
  final String? province;
  final String? district;
  final String? ward;
  final String? addressDetail;
  final String? addressType;
  final bool? setAsDefault;

  OrderCreateDto({
    this.customerId,
    this.subtotal,
    this.discountAmount,
    this.shippingFee,
    this.paymentMethod,
    this.orderItems,
    this.addressId,
    this.receiverName,
    this.phone,
    this.province,
    this.district,
    this.ward,
    this.addressDetail,
    this.addressType,
    this.setAsDefault,
  });

  factory OrderCreateDto.fromJson(Map<String, dynamic> json) => OrderCreateDto(
    customerId: json['customerId'],
    subtotal: json['subtotal'],
    discountAmount: json['discountAmount'],
    shippingFee: json['shippingFee'],
    paymentMethod: json['paymentMethod'],
    orderItems: json['orderItems'],
    addressId: json['addressId'],
    receiverName: json['receiverName'],
    phone: json['phone'],
    province: json['province'],
    district: json['district'],
    ward: json['ward'],
    addressDetail: json['addressDetail'],
    addressType: json['addressType'],
    setAsDefault: json['setAsDefault'],
  );

  Map<String, dynamic> toJson() => {
    'customerId': customerId,
    'subtotal': subtotal,
    'discountAmount': discountAmount,
    'shippingFee': shippingFee,
    'paymentMethod': paymentMethod,
    'orderItems': orderItems,
    'addressId': addressId,
    'receiverName': receiverName,
    'phone': phone,
    'province': province,
    'district': district,
    'ward': ward,
    'addressDetail': addressDetail,
    'addressType': addressType,
    'setAsDefault': setAsDefault,
  };
}

class OrderItem {
  final int? orderItemId;
  final int? orderId;
  final int? productId;
  final int? batchId;
  final double? quantity;
  final double? unitPrice;
  final double? discountAmount;
  final double? totalAmount;
  final Product? product;
  final ProductBatch? batch;

  OrderItem({
    this.orderItemId,
    this.orderId,
    this.productId,
    this.batchId,
    this.quantity,
    this.unitPrice,
    this.discountAmount,
    this.totalAmount,
    this.product,
    this.batch,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
    orderItemId: json['orderItemId'],
    orderId: json['orderId'],
    productId: json['productId'],
    batchId: json['batchId'],
    quantity: json['quantity'],
    unitPrice: json['unitPrice'],
    discountAmount: json['discountAmount'],
    totalAmount: json['totalAmount'],
    product: json['product'],
    batch: json['batch'],
  );

  Map<String, dynamic> toJson() => {
    'orderItemId': orderItemId,
    'orderId': orderId,
    'productId': productId,
    'batchId': batchId,
    'quantity': quantity,
    'unitPrice': unitPrice,
    'discountAmount': discountAmount,
    'totalAmount': totalAmount,
    'product': product,
    'batch': batch,
  };
}

class OrderItemDto {
  final int? productId;
  final double? quantity;
  final double? unitPrice;
  final double? discountAmount;

  OrderItemDto({
    this.productId,
    this.quantity,
    this.unitPrice,
    this.discountAmount,
  });

  factory OrderItemDto.fromJson(Map<String, dynamic> json) => OrderItemDto(
    productId: json['productId'],
    quantity: json['quantity'],
    unitPrice: json['unitPrice'],
    discountAmount: json['discountAmount'],
  );

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'quantity': quantity,
    'unitPrice': unitPrice,
    'discountAmount': discountAmount,
  };
}

class Product {
  final int? productId;
  final int? supplierId;
  final int? categoryId;
  final String? productName;
  final String? description;
  final double? price;
  final String? unit;
  final String? status;
  final int? approvedBy;
  final String? approvedAt;
  final String? rejectReason;
  final String? createdAt;
  final String? updatedAt;
  final Category? category;
  final List<ProductImage>? productImages;
  final double? averageRating;
  final int? reviewsCount;

  Product({
    this.productId,
    this.supplierId,
    this.categoryId,
    this.productName,
    this.description,
    this.price,
    this.unit,
    this.status,
    this.approvedBy,
    this.approvedAt,
    this.rejectReason,
    this.createdAt,
    this.updatedAt,
    this.category,
    this.productImages,
    this.averageRating,
    this.reviewsCount,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
    productId: json['productId'],
    supplierId: json['supplierId'],
    categoryId: json['categoryId'],
    productName: json['productName'],
    description: json['description'],
    price: json['price'],
    unit: json['unit'],
    status: json['status'],
    approvedBy: json['approvedBy'],
    approvedAt: json['approvedAt'],
    rejectReason: json['rejectReason'],
    createdAt: json['createdAt'],
    updatedAt: json['updatedAt'],
    category: json['category'],
    productImages: json['productImages'],
    averageRating: json['averageRating'],
    reviewsCount: json['reviewsCount'],
  );

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'supplierId': supplierId,
    'categoryId': categoryId,
    'productName': productName,
    'description': description,
    'price': price,
    'unit': unit,
    'status': status,
    'approvedBy': approvedBy,
    'approvedAt': approvedAt,
    'rejectReason': rejectReason,
    'createdAt': createdAt,
    'updatedAt': updatedAt,
    'category': category,
    'productImages': productImages,
    'averageRating': averageRating,
    'reviewsCount': reviewsCount,
  };
}

class ProductBatch {
  final int? batchId;
  final int? productId;
  final int? farmId;
  final String? batchCode;
  final String? harvestDate;
  final String? receivedDate;
  final String? expiryDate;
  final double? initialQuantity;
  final String? unit;
  final String? status;
  final String? createdAt;
  final Product? product;

  ProductBatch({
    this.batchId,
    this.productId,
    this.farmId,
    this.batchCode,
    this.harvestDate,
    this.receivedDate,
    this.expiryDate,
    this.initialQuantity,
    this.unit,
    this.status,
    this.createdAt,
    this.product,
  });

  factory ProductBatch.fromJson(Map<String, dynamic> json) => ProductBatch(
    batchId: json['batchId'],
    productId: json['productId'],
    farmId: json['farmId'],
    batchCode: json['batchCode'],
    harvestDate: json['harvestDate'],
    receivedDate: json['receivedDate'],
    expiryDate: json['expiryDate'],
    initialQuantity: json['initialQuantity'],
    unit: json['unit'],
    status: json['status'],
    createdAt: json['createdAt'],
    product: json['product'],
  );

  Map<String, dynamic> toJson() => {
    'batchId': batchId,
    'productId': productId,
    'farmId': farmId,
    'batchCode': batchCode,
    'harvestDate': harvestDate,
    'receivedDate': receivedDate,
    'expiryDate': expiryDate,
    'initialQuantity': initialQuantity,
    'unit': unit,
    'status': status,
    'createdAt': createdAt,
    'product': product,
  };
}

class ProductImage {
  final int? productImageId;
  final int? productId;
  final String? imageUrl;
  final bool? isPrimary;
  final int? sortOrder;

  ProductImage({
    this.productImageId,
    this.productId,
    this.imageUrl,
    this.isPrimary,
    this.sortOrder,
  });

  factory ProductImage.fromJson(Map<String, dynamic> json) => ProductImage(
    productImageId: json['productImageId'],
    productId: json['productId'],
    imageUrl: json['imageUrl'],
    isPrimary: json['isPrimary'],
    sortOrder: json['sortOrder'],
  );

  Map<String, dynamic> toJson() => {
    'productImageId': productImageId,
    'productId': productId,
    'imageUrl': imageUrl,
    'isPrimary': isPrimary,
    'sortOrder': sortOrder,
  };
}

class RedeemRequest {
  final int? userId;
  final int? pointsRequired;
  final String? rewardTitle;
  final bool? isVoucher;
  final String? voucherType;
  final double? discountValue;
  final double? minOrderAmount;

  RedeemRequest({
    this.userId,
    this.pointsRequired,
    this.rewardTitle,
    this.isVoucher,
    this.voucherType,
    this.discountValue,
    this.minOrderAmount,
  });

  factory RedeemRequest.fromJson(Map<String, dynamic> json) => RedeemRequest(
    userId: json['userId'],
    pointsRequired: json['pointsRequired'],
    rewardTitle: json['rewardTitle'],
    isVoucher: json['isVoucher'],
    voucherType: json['voucherType'],
    discountValue: json['discountValue'],
    minOrderAmount: json['minOrderAmount'],
  );

  Map<String, dynamic> toJson() => {
    'userId': userId,
    'pointsRequired': pointsRequired,
    'rewardTitle': rewardTitle,
    'isVoucher': isVoucher,
    'voucherType': voucherType,
    'discountValue': discountValue,
    'minOrderAmount': minOrderAmount,
  };
}

class RegisterDto {
  final String? username;
  final String? password;
  final String? email;
  final String? role;
  final String? phone;
  final String? address;
  final double? latitude;
  final double? longitude;

  RegisterDto({
    this.username,
    this.password,
    this.email,
    this.role,
    this.phone,
    this.address,
    this.latitude,
    this.longitude,
  });

  factory RegisterDto.fromJson(Map<String, dynamic> json) => RegisterDto(
    username: json['username'],
    password: json['password'],
    email: json['email'],
    role: json['role'],
    phone: json['phone'],
    address: json['address'],
    latitude: json['latitude'],
    longitude: json['longitude'],
  );

  Map<String, dynamic> toJson() => {
    'username': username,
    'password': password,
    'email': email,
    'role': role,
    'phone': phone,
    'address': address,
    'latitude': latitude,
    'longitude': longitude,
  };
}

class RegisterRequest {
  final String? fullName;
  final String? email;
  final String? phone;
  final String? password;
  final String? otp;
  final String? verifyMethod;

  RegisterRequest({
    this.fullName,
    this.email,
    this.phone,
    this.password,
    this.otp,
    this.verifyMethod,
  });

  factory RegisterRequest.fromJson(Map<String, dynamic> json) => RegisterRequest(
    fullName: json['fullName'],
    email: json['email'],
    phone: json['phone'],
    password: json['password'],
    otp: json['otp'],
    verifyMethod: json['verifyMethod'],
  );

  Map<String, dynamic> toJson() => {
    'fullName': fullName,
    'email': email,
    'phone': phone,
    'password': password,
    'otp': otp,
    'verifyMethod': verifyMethod,
  };
}

class ResetPasswordRequest {
  final String? email;
  final String? otp;
  final String? newPassword;

  ResetPasswordRequest({
    this.email,
    this.otp,
    this.newPassword,
  });

  factory ResetPasswordRequest.fromJson(Map<String, dynamic> json) => ResetPasswordRequest(
    email: json['email'],
    otp: json['otp'],
    newPassword: json['newPassword'],
  );

  Map<String, dynamic> toJson() => {
    'email': email,
    'otp': otp,
    'newPassword': newPassword,
  };
}

class SendOtpRequest {
  final String? recipient;
  final String? type;

  SendOtpRequest({
    this.recipient,
    this.type,
  });

  factory SendOtpRequest.fromJson(Map<String, dynamic> json) => SendOtpRequest(
    recipient: json['recipient'],
    type: json['type'],
  );

  Map<String, dynamic> toJson() => {
    'recipient': recipient,
    'type': type,
  };
}

class SyncProductImagesDto {
  final String? imageUrl;
  final bool? isPrimary;
  final int? sortOrder;

  SyncProductImagesDto({
    this.imageUrl,
    this.isPrimary,
    this.sortOrder,
  });

  factory SyncProductImagesDto.fromJson(Map<String, dynamic> json) => SyncProductImagesDto(
    imageUrl: json['imageUrl'],
    isPrimary: json['isPrimary'],
    sortOrder: json['sortOrder'],
  );

  Map<String, dynamic> toJson() => {
    'imageUrl': imageUrl,
    'isPrimary': isPrimary,
    'sortOrder': sortOrder,
  };
}

class TrackBehaviorDto {
  final int? userId;
  final String? sessionId;
  final int? productId;
  final String? actionType;
  final String? searchKeyword;
  final String? recommendationType;

  TrackBehaviorDto({
    this.userId,
    this.sessionId,
    this.productId,
    this.actionType,
    this.searchKeyword,
    this.recommendationType,
  });

  factory TrackBehaviorDto.fromJson(Map<String, dynamic> json) => TrackBehaviorDto(
    userId: json['userId'],
    sessionId: json['sessionId'],
    productId: json['productId'],
    actionType: json['actionType'],
    searchKeyword: json['searchKeyword'],
    recommendationType: json['recommendationType'],
  );

  Map<String, dynamic> toJson() => {
    'userId': userId,
    'sessionId': sessionId,
    'productId': productId,
    'actionType': actionType,
    'searchKeyword': searchKeyword,
    'recommendationType': recommendationType,
  };
}

class UpdateReviewRequest {
  final int? rating;
  final String? comment;
  final List<String>? imageUrls;

  UpdateReviewRequest({
    this.rating,
    this.comment,
    this.imageUrls,
  });

  factory UpdateReviewRequest.fromJson(Map<String, dynamic> json) => UpdateReviewRequest(
    rating: json['rating'],
    comment: json['comment'],
    imageUrls: json['imageUrls'],
  );

  Map<String, dynamic> toJson() => {
    'rating': rating,
    'comment': comment,
    'imageUrls': imageUrls,
  };
}

class User {
  final int? userId;
  final String? fullName;
  final String? email;
  final String? phone;
  final String? passwordHash;
  final int? roleId;
  final String? status;
  final String? avatarUrl;
  final String? createdAt;
  final String? updatedAt;

  User({
    this.userId,
    this.fullName,
    this.email,
    this.phone,
    this.passwordHash,
    this.roleId,
    this.status,
    this.avatarUrl,
    this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
    userId: json['userId'],
    fullName: json['fullName'],
    email: json['email'],
    phone: json['phone'],
    passwordHash: json['passwordHash'],
    roleId: json['roleId'],
    status: json['status'],
    avatarUrl: json['avatarUrl'],
    createdAt: json['createdAt'],
    updatedAt: json['updatedAt'],
  );

  Map<String, dynamic> toJson() => {
    'userId': userId,
    'fullName': fullName,
    'email': email,
    'phone': phone,
    'passwordHash': passwordHash,
    'roleId': roleId,
    'status': status,
    'avatarUrl': avatarUrl,
    'createdAt': createdAt,
    'updatedAt': updatedAt,
  };
}

