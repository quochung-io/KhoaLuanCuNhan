const fs = require('fs');
const path = require('path');

let raw = fs.readFileSync(path.join(__dirname, 'products_stats.json'), 'utf8');
if (raw.charCodeAt(0) === 0xFEFF) {
  raw = raw.slice(1);
}
const allProducts = JSON.parse(raw);

const customerIds = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const IMAGES = {
  1: [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80'
  ],
  2: [
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80'
  ],
  3: [
    'https://images.unsplash.com/photo-1574316071802-0d684efa7cd5?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608797178974-15b35a68d00d?w=600&auto=format&fit=crop&q=80'
  ],
  4: [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80'
  ]
};

const COMMENTS_BY_CAT = {
  1: {
    5: [
      'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.',
      'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.',
      'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.',
      'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.',
      'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.',
      'Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!'
    ],
    4: [
      'Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.',
      'Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.',
      'Nấu canh rất ngọt nước, củ quả tươi. Nếu được giao sớm hơn vào buổi sáng thì tuyệt vời hơn.',
      'Đóng gói cẩn thận, sản phẩm chất lượng. Sẽ tiếp tục mua ủng hộ bà con nông dân.'
    ],
    3: [
      'Rau tươi vừa phải, vài lá ngoài hơi dập nhẹ do vận chuyển đường dài nhưng nhặt đi bên trong vẫn ngon.',
      'Chất lượng ở mức ổn, củ kích thước không đều nhau lắm nhưng ăn vẫn ngọt.',
      'Tạm hài lòng, sản phẩm sạch nhưng giá đợt này tăng nhẹ so với tuần trước.'
    ],
    2: [
      'Rau đến nơi hơi héo vì thời tiết nắng nóng, shop nên bọc thêm túi giữ lạnh trong mùa hè.',
      'Bị dập một góc dưới đáy túi do chèn ép lúc vận chuyển. Mong shop cải thiện khâu đóng thùng.'
    ],
    1: [
      'Giao hàng hơi chậm làm rau dập nát nhiều, may mà nhân viên chăm sóc khách hàng hỗ trợ đổi trả nhiệt tình.'
    ]
  },
  2: {
    5: [
      'Trái cây cực kỳ ngọt và mọng nước, mùi thơm lừng khắp phòng khi vừa bóc hộp ra.',
      'Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!',
      'Giao hàng đóng xốp lưới từng quả rất kỹ, quả tươi nguyên cuống xanh. Đánh giá 5 sao!',
      'Vị ngọt thanh dịu mát, không hề gắt cổ. Cả nhà mình ai cũng khen nức nở.',
      'Chất lượng xuất sắc, đúng cam kết quả to đều đẹp, mua biếu tặng hoặc ăn đều rất sang trọng.',
      'Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.'
    ],
    4: [
      'Trái cây tươi ngon, mọng nước. Quả hơi nhỏ hơn ảnh chụp một chút nhưng độ ngọt thì không chê được.',
      'Đóng gói xốp bảo vệ chu đáo. Shipper giao đúng hẹn, trái cây ăn rất giòn và ngọt.',
      'Vị ngọt thanh tự nhiên, để tủ lạnh ăn mát lịm. Trừ nhẹ 1 sao vì vỏ hơi trầy xíu xiu bên ngoài.',
      'Chất lượng ổn định, giá thành hợp lý so với trái cây nhập khẩu.'
    ],
    3: [
      'Quả hơi chua nhẹ so với mô tả, mình phải để thêm 2 hôm cho xuống đường thì ăn ngọt hơn.',
      'Trái cây độ tươi bình thường, quả không được đều nhau cho lắm, vị ngọt trung bình.',
      'Ăn được nhưng chưa xuất sắc như kỳ vọng so với mức giá này.'
    ],
    2: [
      'Có 1-2 quả bị cấn thâm một góc do chèn ép lúc giao hàng, mong bên vận chuyển cẩn thận hơn.',
      'Độ ngọt chưa tới, trái cây còn hơi non cuống nên ăn chưa đượm vị.'
    ],
    1: [
      'Giao nhầm loại trái cây so với đơn mình đặt, tuy nhiên shop đã chủ động xin lỗi và hoàn tiền nhanh.'
    ]
  },
  3: {
    5: [
      'Rau thơm nức mũi, lá xanh mơn mởn không bị úa vàng lá nào. Cho vào bát phở thơm dậy mùi!',
      'Tươi rói như vừa mới hái ở vườn vào, nhặt rất sạch sẽ hầu như không có cọng già.',
      'Mùi tinh dầu tự nhiên rất đậm đà, đóng gói khay sạch sẽ dễ bảo quản trong ngăn mát tủ lạnh.',
      'Rau thơm sạch chuẩn hữu cơ, ăn sống yên tâm tuyệt đối.'
    ],
    4: [
      'Rau thơm và tươi, đọt non. Đóng gói cẩn thận. Giá hợp lý.',
      'Lá tươi xanh, mùi vị rất nồng nàn. Shipper giao nhanh.'
    ],
    3: [
      'Rau thơm nhưng bó hơi nhỏ so với cảm nhận, có vài ngọn bị thâm nhẹ.',
      'Độ tươi vừa phải, bảo quản tủ lạnh được khoảng 2 ngày.'
    ],
    2: [
      'Rau thơm bị giập hơi nhiều trong túi nilon, shop nên đóng hộp nhựa để bảo vệ rau thơm tốt hơn.'
    ],
    1: [
      'Rau bị dập úng khi nhận hàng do thời gian giao kéo dài.'
    ]
  },
  4: {
    5: [
      'Hạt mẩy đều, chắc nịch, không hề có hạt lép hay mốc. Nấu sữa hạt thơm béo ngậy!',
      'Nấm tươi dai giòn sần sật, nấu canh sườn hay lẩu nấm ngọt lịm tự nhiên.',
      'Đóng gói hút chân không dày dặn, hạt mới thu hoạch nên giữ nguyên mùi thơm đặc trưng.',
      'Sản phẩm chất lượng vượt trội, hạt dẻo thơm không bị khô sượng. Đã giới thiệu cho bạn bè.',
      'Rất đáng tiền, nguyên liệu sạch thuần tự nhiên tốt cho sức khỏe cả nhà.'
    ],
    4: [
      'Hạt sạch, thơm ngon. Nếu túi có thêm khóa zip bấm miệng thì bảo quản sẽ tiện lợi hơn.',
      'Chất lượng tốt, nấu nhanh mềm và bùi béo. Đóng gói lịch sự.',
      'Nấm tươi ngon, sạch sẽ, chân nấm đã được cắt tỉa cẩn thận.'
    ],
    3: [
      'Chất lượng hạt ở mức khá, có lẫn một ít hạt kích thước không đồng đều.',
      'Tạm ổn, ăn thơm bùi nhưng giá hơi cao so với mặt bằng chung.'
    ],
    2: [
      'Hạt có mùi hơi cũ một chút so với đợt trước, mong shop kiểm tra hạn xuất kho kỹ hơn.'
    ],
    1: [
      'Bao bì bị rách nhẹ làm rơi vãi một ít hạt ra ngoài trong lúc shipper vận chuyển.'
    ]
  }
};

const unreviewed = allProducts.filter(p => p.ExistingReviews === 0);
const reviewed = allProducts.filter(p => p.ExistingReviews > 0);

// Select 85 products from unreviewed to review
// 85 + 15 = 100 reviewed products (76.3% coverage of 131 products)
const productsToReview = unreviewed.slice(0, 85);
const remainingUnreviewed = unreviewed.slice(85);

console.log('Products to review count:', productsToReview.length);
console.log('Remaining unreviewed products (empty state):', remainingUnreviewed.length);

let totalGeneratedReviews = 0;
let totalGeneratedImages = 0;
const sqlStatements = [];

sqlStatements.push('-- SEED EXPANDED REVIEWS SCRIPT (TARGET ~75% COVERAGE)');
sqlStatements.push('USE QL_WebMuaBanNongSan;');
sqlStatements.push('SET NOCOUNT ON;');
sqlStatements.push('BEGIN TRANSACTION;');
sqlStatements.push('DECLARE @NewReviewId BIGINT;');

function getWeightedRating() {
  const r = Math.random() * 100;
  if (r < 55) return 5;
  if (r < 80) return 4;
  if (r < 92) return 3;
  if (r < 97) return 2;
  return 1;
}

productsToReview.forEach((prod, idx) => {
  let numReviews = 1;
  if (idx < 15) {
    numReviews = 4 + Math.floor(Math.random() * 3); // 4-6
  } else if (idx < 50) {
    numReviews = 2 + Math.floor(Math.random() * 2); // 2-3
  } else {
    numReviews = 1 + (Math.random() < 0.4 ? 1 : 0); // 1-2
  }

  const catId = (prod.CategoryId >= 1 && prod.CategoryId <= 4) ? prod.CategoryId : 1;
  const catPool = COMMENTS_BY_CAT[catId] || COMMENTS_BY_CAT[1];
  const catImages = IMAGES[catId] || IMAGES[1];

  const shuffledCustomers = [...customerIds].sort(() => 0.5 - Math.random());

  for (let rIdx = 0; rIdx < numReviews; rIdx++) {
    const custId = shuffledCustomers[rIdx % shuffledCustomers.length];
    const rating = getWeightedRating();
    const commentPool = catPool[rating] || catPool[5];
    const baseComment = commentPool[Math.floor(Math.random() * commentPool.length)];
    
    let comment = baseComment;
    if (Math.random() < 0.35) {
      if (rating >= 4) {
        comment = prod.ProductName + ' ngon lắm! ' + baseComment;
      } else {
        comment = 'Về ' + prod.ProductName + ': ' + baseComment;
      }
    }
    const escapedComment = comment.replace(/'/g, "''");

    const daysAgo = Math.floor(Math.random() * 75) + 1;
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const isPurchased = Math.random() < 0.8 ? 1 : 0;

    let helpful = 0;
    if (rating >= 4) {
      helpful = Math.floor(Math.random() * 16);
      if (Math.random() < 0.1) helpful += 12;
    } else {
      helpful = Math.floor(Math.random() * 5);
    }

    const reportCount = (rating === 1 && Math.random() < 0.2) ? 1 : 0;

    sqlStatements.push(`
INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (${custId}, ${prod.ProductId}, ${rating}, N'${escapedComment}', DATEADD(MINUTE, -${minutesAgo}, DATEADD(HOUR, -${hoursAgo}, DATEADD(DAY, -${daysAgo}, GETDATE()))), N'Approved', ${helpful}, ${reportCount}, ${isPurchased});
SET @NewReviewId = SCOPE_IDENTITY();`);

    totalGeneratedReviews++;

    if (Math.random() < 0.18) {
      const imgUrl = catImages[Math.floor(Math.random() * catImages.length)];
      sqlStatements.push(`INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, '${imgUrl}');`);
      totalGeneratedImages++;

      if (Math.random() < 0.25) {
        const imgUrl2 = catImages[(Math.floor(Math.random() * catImages.length) + 1) % catImages.length];
        sqlStatements.push(`INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, '${imgUrl2}');`);
        totalGeneratedImages++;
      }
    }
  }
});

sqlStatements.push('COMMIT TRANSACTION;');
sqlStatements.push('PRINT N"SUCCESS: Seeded reviews successfully!";');

const finalSql = sqlStatements.join('\n');
fs.writeFileSync(path.join(__dirname, 'Seed_Reviews_Expanded.sql'), finalSql, 'utf8');

console.log(`Successfully generated Seed_Reviews_Expanded.sql!`);
console.log(`Total new reviews generated: ${totalGeneratedReviews}`);
console.log(`Total new review images generated: ${totalGeneratedImages}`);
console.log(`Total reviewed products will be: ${reviewed.length + productsToReview.length} / ${allProducts.length} (${((reviewed.length + productsToReview.length) / allProducts.length * 100).toFixed(1)}%)`);
console.log(`Total unreviewed products left: ${remainingUnreviewed.length} (${(remainingUnreviewed.length / allProducts.length * 100).toFixed(1)}%)`);