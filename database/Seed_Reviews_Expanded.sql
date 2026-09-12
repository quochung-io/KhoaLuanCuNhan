-- SEED EXPANDED REVIEWS SCRIPT (TARGET ~75% COVERAGE)
USE QL_WebMuaBanNongSan;
SET NOCOUNT ON;
BEGIN TRANSACTION;
DECLARE @NewReviewId BIGINT;

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 6, 5, N'Rau muống sạch ngon lắm! Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -6, DATEADD(HOUR, -3, DATEADD(DAY, -23, GETDATE()))), N'Approved', 5, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 6, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -25, DATEADD(HOUR, -13, DATEADD(DAY, -73, GETDATE()))), N'Approved', 21, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 6, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -4, DATEADD(HOUR, -7, DATEADD(DAY, -42, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 6, 4, N'Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -1, DATEADD(HOUR, -7, DATEADD(DAY, -3, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 6, 3, N'Chất lượng ở mức ổn, củ kích thước không đều nhau lắm nhưng ăn vẫn ngọt.', DATEADD(MINUTE, -42, DATEADD(HOUR, -16, DATEADD(DAY, -53, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 7, 4, N'Lá tươi xanh, mùi vị rất nồng nàn. Shipper giao nhanh.', DATEADD(MINUTE, -20, DATEADD(HOUR, -10, DATEADD(DAY, -33, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1574316071802-0d684efa7cd5?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1608797178974-15b35a68d00d?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 7, 4, N'Lá tươi xanh, mùi vị rất nồng nàn. Shipper giao nhanh.', DATEADD(MINUTE, -52, DATEADD(HOUR, -1, DATEADD(DAY, -42, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 7, 2, N'Rau thơm bị giập hơi nhiều trong túi nilon, shop nên đóng hộp nhựa để bảo vệ rau thơm tốt hơn.', DATEADD(MINUTE, -6, DATEADD(HOUR, -12, DATEADD(DAY, -29, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 7, 5, N'Ngò rí ngon lắm! Rau thơm sạch chuẩn hữu cơ, ăn sống yên tâm tuyệt đối.', DATEADD(MINUTE, -56, DATEADD(HOUR, -3, DATEADD(DAY, -35, GETDATE()))), N'Approved', 23, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 12, 3, N'Ăn được nhưng chưa xuất sắc như kỳ vọng so với mức giá này.', DATEADD(MINUTE, -20, DATEADD(HOUR, -17, DATEADD(DAY, -38, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 12, 5, N'Ổi nữ hoàng ngon lắm! Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -20, DATEADD(HOUR, -1, DATEADD(DAY, -48, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 12, 4, N'Chất lượng ổn định, giá thành hợp lý so với trái cây nhập khẩu.', DATEADD(MINUTE, -5, DATEADD(HOUR, -6, DATEADD(DAY, -62, GETDATE()))), N'Approved', 12, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 12, 5, N'Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -35, DATEADD(HOUR, -22, DATEADD(DAY, -5, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 12, 5, N'Ổi nữ hoàng ngon lắm! Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -33, DATEADD(HOUR, -18, DATEADD(DAY, -11, GETDATE()))), N'Approved', 12, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 12, 5, N'Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -52, DATEADD(HOUR, -4, DATEADD(DAY, -11, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 15, 3, N'Về Cải ngọt VietGAP: Tạm hài lòng, sản phẩm sạch nhưng giá đợt này tăng nhẹ so với tuần trước.', DATEADD(MINUTE, -17, DATEADD(HOUR, -16, DATEADD(DAY, -70, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 15, 4, N'Đóng gói cẩn thận, sản phẩm chất lượng. Sẽ tiếp tục mua ủng hộ bà con nông dân.', DATEADD(MINUTE, -25, DATEADD(HOUR, -21, DATEADD(DAY, -48, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 15, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -41, DATEADD(HOUR, -18, DATEADD(DAY, -28, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 15, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -34, DATEADD(HOUR, -7, DATEADD(DAY, -16, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 15, 4, N'Nấu canh rất ngọt nước, củ quả tươi. Nếu được giao sớm hơn vào buổi sáng thì tuyệt vời hơn.', DATEADD(MINUTE, -49, DATEADD(HOUR, -12, DATEADD(DAY, -13, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 15, 4, N'Cải ngọt VietGAP ngon lắm! Nấu canh rất ngọt nước, củ quả tươi. Nếu được giao sớm hơn vào buổi sáng thì tuyệt vời hơn.', DATEADD(MINUTE, -8, DATEADD(HOUR, -8, DATEADD(DAY, -7, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 16, 2, N'Rau đến nơi hơi héo vì thời tiết nắng nóng, shop nên bọc thêm túi giữ lạnh trong mùa hè.', DATEADD(MINUTE, -26, DATEADD(HOUR, -9, DATEADD(DAY, -55, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 16, 3, N'Về Cải ngồng Mộc Châu: Tạm hài lòng, sản phẩm sạch nhưng giá đợt này tăng nhẹ so với tuần trước.', DATEADD(MINUTE, -42, DATEADD(HOUR, -8, DATEADD(DAY, -42, GETDATE()))), N'Approved', 4, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 16, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -42, DATEADD(HOUR, -1, DATEADD(DAY, -36, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 16, 4, N'Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -42, DATEADD(HOUR, -8, DATEADD(DAY, -13, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 16, 4, N'Cải ngồng Mộc Châu ngon lắm! Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -47, DATEADD(HOUR, -14, DATEADD(DAY, -27, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 16, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -21, DATEADD(HOUR, -23, DATEADD(DAY, -54, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 17, 4, N'Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -41, DATEADD(HOUR, -5, DATEADD(DAY, -8, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 17, 5, N'Rau dền đỏ Miền Tây ngon lắm! Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -29, DATEADD(HOUR, -9, DATEADD(DAY, -50, GETDATE()))), N'Approved', 8, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 17, 4, N'Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -1, DATEADD(HOUR, -22, DATEADD(DAY, -44, GETDATE()))), N'Approved', 6, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 17, 5, N'Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -6, DATEADD(HOUR, -20, DATEADD(DAY, -34, GETDATE()))), N'Approved', 14, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 17, 5, N'Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -3, DATEADD(HOUR, -21, DATEADD(DAY, -8, GETDATE()))), N'Approved', 10, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 18, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -41, DATEADD(HOUR, -12, DATEADD(DAY, -57, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 18, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -0, DATEADD(HOUR, -0, DATEADD(DAY, -37, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 18, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -10, DATEADD(HOUR, -19, DATEADD(DAY, -38, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 18, 5, N'Rau mồng tơi vườn ngon lắm! Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -16, DATEADD(HOUR, -4, DATEADD(DAY, -16, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 20, 4, N'Rau thơm và tươi, đọt non. Đóng gói cẩn thận. Giá hợp lý.', DATEADD(MINUTE, -44, DATEADD(HOUR, -15, DATEADD(DAY, -31, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 20, 5, N'Rau càng cua tự nhiên ngon lắm! Rau thơm nức mũi, lá xanh mơn mởn không bị úa vàng lá nào. Cho vào bát phở thơm dậy mùi!', DATEADD(MINUTE, -9, DATEADD(HOUR, -1, DATEADD(DAY, -10, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 20, 3, N'Về Rau càng cua tự nhiên: Độ tươi vừa phải, bảo quản tủ lạnh được khoảng 2 ngày.', DATEADD(MINUTE, -16, DATEADD(HOUR, -5, DATEADD(DAY, -53, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 20, 5, N'Rau càng cua tự nhiên ngon lắm! Rau thơm nức mũi, lá xanh mơn mởn không bị úa vàng lá nào. Cho vào bát phở thơm dậy mùi!', DATEADD(MINUTE, -37, DATEADD(HOUR, -18, DATEADD(DAY, -74, GETDATE()))), N'Approved', 9, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 20, 3, N'Rau thơm nhưng bó hơi nhỏ so với cảm nhận, có vài ngọn bị thâm nhẹ.', DATEADD(MINUTE, -50, DATEADD(HOUR, -1, DATEADD(DAY, -24, GETDATE()))), N'Approved', 2, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 21, 4, N'Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -57, DATEADD(HOUR, -20, DATEADD(DAY, -12, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 21, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -55, DATEADD(HOUR, -13, DATEADD(DAY, -49, GETDATE()))), N'Approved', 10, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 21, 5, N'Rau ngót Nhật sạch ngon lắm! Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -1, DATEADD(HOUR, -10, DATEADD(DAY, -24, GETDATE()))), N'Approved', 23, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 21, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -41, DATEADD(HOUR, -23, DATEADD(DAY, -37, GETDATE()))), N'Approved', 3, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 21, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -32, DATEADD(HOUR, -10, DATEADD(DAY, -2, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 22, 4, N'Nấu canh rất ngọt nước, củ quả tươi. Nếu được giao sớm hơn vào buổi sáng thì tuyệt vời hơn.', DATEADD(MINUTE, -28, DATEADD(HOUR, -15, DATEADD(DAY, -57, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 22, 2, N'Bị dập một góc dưới đáy túi do chèn ép lúc vận chuyển. Mong shop cải thiện khâu đóng thùng.', DATEADD(MINUTE, -41, DATEADD(HOUR, -6, DATEADD(DAY, -45, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 22, 3, N'Rau tươi vừa phải, vài lá ngoài hơi dập nhẹ do vận chuyển đường dài nhưng nhặt đi bên trong vẫn ngon.', DATEADD(MINUTE, -7, DATEADD(HOUR, -12, DATEADD(DAY, -33, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 22, 5, N'Đọt bí non Mộc Châu ngon lắm! Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -42, DATEADD(HOUR, -18, DATEADD(DAY, -72, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 24, 5, N'Củ dền đỏ Đà Lạt ngon lắm! Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -7, DATEADD(HOUR, -8, DATEADD(DAY, -9, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 24, 3, N'Rau tươi vừa phải, vài lá ngoài hơi dập nhẹ do vận chuyển đường dài nhưng nhặt đi bên trong vẫn ngon.', DATEADD(MINUTE, -58, DATEADD(HOUR, -9, DATEADD(DAY, -25, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 24, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -23, DATEADD(HOUR, -3, DATEADD(DAY, -27, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 24, 5, N'Củ dền đỏ Đà Lạt ngon lắm! Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -0, DATEADD(HOUR, -16, DATEADD(DAY, -27, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 26, 5, N'Bầu sao Miền Tây ngon lắm! Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -8, DATEADD(HOUR, -17, DATEADD(DAY, -73, GETDATE()))), N'Approved', 23, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 26, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -37, DATEADD(HOUR, -16, DATEADD(DAY, -5, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 26, 5, N'Bầu sao Miền Tây ngon lắm! Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -51, DATEADD(HOUR, -8, DATEADD(DAY, -73, GETDATE()))), N'Approved', 13, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 26, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -3, DATEADD(HOUR, -1, DATEADD(DAY, -21, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 26, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -18, DATEADD(HOUR, -16, DATEADD(DAY, -21, GETDATE()))), N'Approved', 19, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 26, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -51, DATEADD(HOUR, -1, DATEADD(DAY, -30, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 27, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -39, DATEADD(HOUR, -17, DATEADD(DAY, -1, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 27, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -28, DATEADD(HOUR, -18, DATEADD(DAY, -30, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 27, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -43, DATEADD(HOUR, -3, DATEADD(DAY, -54, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 27, 3, N'Về Mướp hương đồng quê: Rau tươi vừa phải, vài lá ngoài hơi dập nhẹ do vận chuyển đường dài nhưng nhặt đi bên trong vẫn ngon.', DATEADD(MINUTE, -33, DATEADD(HOUR, -8, DATEADD(DAY, -75, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 27, 3, N'Rau tươi vừa phải, vài lá ngoài hơi dập nhẹ do vận chuyển đường dài nhưng nhặt đi bên trong vẫn ngon.', DATEADD(MINUTE, -5, DATEADD(HOUR, -11, DATEADD(DAY, -6, GETDATE()))), N'Approved', 3, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 29, 5, N'Đậu bắp baby xanh ngon lắm! Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -21, DATEADD(HOUR, -17, DATEADD(DAY, -62, GETDATE()))), N'Approved', 2, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 29, 4, N'Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -44, DATEADD(HOUR, -1, DATEADD(DAY, -68, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 29, 5, N'Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -25, DATEADD(HOUR, -14, DATEADD(DAY, -9, GETDATE()))), N'Approved', 1, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 29, 5, N'Đậu bắp baby xanh ngon lắm! Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -44, DATEADD(HOUR, -17, DATEADD(DAY, -50, GETDATE()))), N'Approved', 9, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 30, 3, N'Về Su hào Mộc Châu: Tạm hài lòng, sản phẩm sạch nhưng giá đợt này tăng nhẹ so với tuần trước.', DATEADD(MINUTE, -43, DATEADD(HOUR, -22, DATEADD(DAY, -17, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 30, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -34, DATEADD(HOUR, -18, DATEADD(DAY, -44, GETDATE()))), N'Approved', 9, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 30, 5, N'Su hào Mộc Châu ngon lắm! Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -25, DATEADD(HOUR, -15, DATEADD(DAY, -12, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 30, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -16, DATEADD(HOUR, -20, DATEADD(DAY, -22, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 30, 5, N'Su hào Mộc Châu ngon lắm! Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -32, DATEADD(HOUR, -11, DATEADD(DAY, -46, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 31, 3, N'Chất lượng ở mức ổn, củ kích thước không đều nhau lắm nhưng ăn vẫn ngọt.', DATEADD(MINUTE, -54, DATEADD(HOUR, -18, DATEADD(DAY, -4, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 31, 5, N'Củ cải trắng hữu cơ ngon lắm! Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -36, DATEADD(HOUR, -12, DATEADD(DAY, -20, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 32, 1, N'Về Khoai lang mật Đà Lạt: Giao hàng hơi chậm làm rau dập nát nhiều, may mà nhân viên chăm sóc khách hàng hỗ trợ đổi trả nhiệt tình.', DATEADD(MINUTE, -10, DATEADD(HOUR, -1, DATEADD(DAY, -30, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 32, 5, N'Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -52, DATEADD(HOUR, -18, DATEADD(DAY, -13, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 33, 5, N'Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -23, DATEADD(HOUR, -19, DATEADD(DAY, -3, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 33, 3, N'Về Sầu riêng Ri6 Bến Tre: Trái cây độ tươi bình thường, quả không được đều nhau cho lắm, vị ngọt trung bình.', DATEADD(MINUTE, -43, DATEADD(HOUR, -10, DATEADD(DAY, -50, GETDATE()))), N'Approved', 1, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 34, 4, N'Bưởi da xanh Ruột Hồng Bến Tre ngon lắm! Vị ngọt thanh tự nhiên, để tủ lạnh ăn mát lịm. Trừ nhẹ 1 sao vì vỏ hơi trầy xíu xiu bên ngoài.', DATEADD(MINUTE, -28, DATEADD(HOUR, -11, DATEADD(DAY, -55, GETDATE()))), N'Approved', 9, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 34, 4, N'Trái cây tươi ngon, mọng nước. Quả hơi nhỏ hơn ảnh chụp một chút nhưng độ ngọt thì không chê được.', DATEADD(MINUTE, -38, DATEADD(HOUR, -20, DATEADD(DAY, -16, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 35, 5, N'Vị ngọt thanh dịu mát, không hề gắt cổ. Cả nhà mình ai cũng khen nức nở.', DATEADD(MINUTE, -39, DATEADD(HOUR, -9, DATEADD(DAY, -11, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 35, 5, N'Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -4, DATEADD(HOUR, -13, DATEADD(DAY, -24, GETDATE()))), N'Approved', 5, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 35, 3, N'Quả hơi chua nhẹ so với mô tả, mình phải để thêm 2 hôm cho xuống đường thì ăn ngọt hơn.', DATEADD(MINUTE, -35, DATEADD(HOUR, -14, DATEADD(DAY, -51, GETDATE()))), N'Approved', 2, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 36, 5, N'Chôm chôm nhãn Tiền Giang ngon lắm! Chất lượng xuất sắc, đúng cam kết quả to đều đẹp, mua biếu tặng hoặc ăn đều rất sang trọng.', DATEADD(MINUTE, -2, DATEADD(HOUR, -10, DATEADD(DAY, -68, GETDATE()))), N'Approved', 0, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 36, 4, N'Chôm chôm nhãn Tiền Giang ngon lắm! Đóng gói xốp bảo vệ chu đáo. Shipper giao đúng hẹn, trái cây ăn rất giòn và ngọt.', DATEADD(MINUTE, -50, DATEADD(HOUR, -23, DATEADD(DAY, -62, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 36, 5, N'Chôm chôm nhãn Tiền Giang ngon lắm! Trái cây cực kỳ ngọt và mọng nước, mùi thơm lừng khắp phòng khi vừa bóc hộp ra.', DATEADD(MINUTE, -41, DATEADD(HOUR, -11, DATEADD(DAY, -66, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 37, 5, N'Vị ngọt thanh dịu mát, không hề gắt cổ. Cả nhà mình ai cũng khen nức nở.', DATEADD(MINUTE, -7, DATEADD(HOUR, -13, DATEADD(DAY, -75, GETDATE()))), N'Approved', 11, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 37, 5, N'Mận hậu Bắc Hà ngon lắm! Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -36, DATEADD(HOUR, -20, DATEADD(DAY, -26, GETDATE()))), N'Approved', 9, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 37, 5, N'Mận hậu Bắc Hà ngon lắm! Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -44, DATEADD(HOUR, -22, DATEADD(DAY, -63, GETDATE()))), N'Approved', 23, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 38, 5, N'Nhãn xuồng cơm vàng Vũng Tàu ngon lắm! Vị ngọt thanh dịu mát, không hề gắt cổ. Cả nhà mình ai cũng khen nức nở.', DATEADD(MINUTE, -42, DATEADD(HOUR, -5, DATEADD(DAY, -50, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 38, 5, N'Vị ngọt thanh dịu mát, không hề gắt cổ. Cả nhà mình ai cũng khen nức nở.', DATEADD(MINUTE, -50, DATEADD(HOUR, -3, DATEADD(DAY, -17, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 38, 2, N'Có 1-2 quả bị cấn thâm một góc do chèn ép lúc giao hàng, mong bên vận chuyển cẩn thận hơn.', DATEADD(MINUTE, -41, DATEADD(HOUR, -14, DATEADD(DAY, -44, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 39, 5, N'Đu đủ ruột đỏ tự nhiên ngon lắm! Vị ngọt thanh dịu mát, không hề gắt cổ. Cả nhà mình ai cũng khen nức nở.', DATEADD(MINUTE, -56, DATEADD(HOUR, -6, DATEADD(DAY, -20, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 39, 4, N'Vị ngọt thanh tự nhiên, để tủ lạnh ăn mát lịm. Trừ nhẹ 1 sao vì vỏ hơi trầy xíu xiu bên ngoài.', DATEADD(MINUTE, -4, DATEADD(HOUR, -5, DATEADD(DAY, -50, GETDATE()))), N'Approved', 8, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 40, 5, N'Giao hàng đóng xốp lưới từng quả rất kỹ, quả tươi nguyên cuống xanh. Đánh giá 5 sao!', DATEADD(MINUTE, -18, DATEADD(HOUR, -13, DATEADD(DAY, -59, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 40, 3, N'Trái cây độ tươi bình thường, quả không được đều nhau cho lắm, vị ngọt trung bình.', DATEADD(MINUTE, -57, DATEADD(HOUR, -10, DATEADD(DAY, -66, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 40, 5, N'Giao hàng đóng xốp lưới từng quả rất kỹ, quả tươi nguyên cuống xanh. Đánh giá 5 sao!', DATEADD(MINUTE, -38, DATEADD(HOUR, -11, DATEADD(DAY, -42, GETDATE()))), N'Approved', 15, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 41, 5, N'Trái cây cực kỳ ngọt và mọng nước, mùi thơm lừng khắp phòng khi vừa bóc hộp ra.', DATEADD(MINUTE, -20, DATEADD(HOUR, -23, DATEADD(DAY, -33, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 41, 4, N'Chuối ngự Đại Hoàng ngon lắm! Chất lượng ổn định, giá thành hợp lý so với trái cây nhập khẩu.', DATEADD(MINUTE, -43, DATEADD(HOUR, -0, DATEADD(DAY, -38, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 42, 3, N'Về Vải thiều Lục Ngạn: Trái cây độ tươi bình thường, quả không được đều nhau cho lắm, vị ngọt trung bình.', DATEADD(MINUTE, -53, DATEADD(HOUR, -23, DATEADD(DAY, -11, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 42, 3, N'Ăn được nhưng chưa xuất sắc như kỳ vọng so với mức giá này.', DATEADD(MINUTE, -37, DATEADD(HOUR, -14, DATEADD(DAY, -72, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 43, 5, N'Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -23, DATEADD(HOUR, -5, DATEADD(DAY, -49, GETDATE()))), N'Approved', 15, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 43, 5, N'Giao hàng đóng xốp lưới từng quả rất kỹ, quả tươi nguyên cuống xanh. Đánh giá 5 sao!', DATEADD(MINUTE, -14, DATEADD(HOUR, -22, DATEADD(DAY, -16, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 43, 4, N'Vị ngọt thanh tự nhiên, để tủ lạnh ăn mát lịm. Trừ nhẹ 1 sao vì vỏ hơi trầy xíu xiu bên ngoài.', DATEADD(MINUTE, -56, DATEADD(HOUR, -13, DATEADD(DAY, -31, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 44, 4, N'Mít tố nữ Miền Tây ngon lắm! Đóng gói xốp bảo vệ chu đáo. Shipper giao đúng hẹn, trái cây ăn rất giòn và ngọt.', DATEADD(MINUTE, -39, DATEADD(HOUR, -9, DATEADD(DAY, -40, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 44, 3, N'Trái cây độ tươi bình thường, quả không được đều nhau cho lắm, vị ngọt trung bình.', DATEADD(MINUTE, -31, DATEADD(HOUR, -16, DATEADD(DAY, -66, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 44, 5, N'Chất lượng xuất sắc, đúng cam kết quả to đều đẹp, mua biếu tặng hoặc ăn đều rất sang trọng.', DATEADD(MINUTE, -3, DATEADD(HOUR, -16, DATEADD(DAY, -28, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 45, 4, N'Quýt hồng Lai Vung ngon lắm! Trái cây tươi ngon, mọng nước. Quả hơi nhỏ hơn ảnh chụp một chút nhưng độ ngọt thì không chê được.', DATEADD(MINUTE, -15, DATEADD(HOUR, -19, DATEADD(DAY, -6, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 45, 4, N'Trái cây tươi ngon, mọng nước. Quả hơi nhỏ hơn ảnh chụp một chút nhưng độ ngọt thì không chê được.', DATEADD(MINUTE, -51, DATEADD(HOUR, -4, DATEADD(DAY, -41, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 45, 5, N'Vị ngọt thanh dịu mát, không hề gắt cổ. Cả nhà mình ai cũng khen nức nở.', DATEADD(MINUTE, -47, DATEADD(HOUR, -11, DATEADD(DAY, -36, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 46, 4, N'Trái cây tươi ngon, mọng nước. Quả hơi nhỏ hơn ảnh chụp một chút nhưng độ ngọt thì không chê được.', DATEADD(MINUTE, -8, DATEADD(HOUR, -12, DATEADD(DAY, -39, GETDATE()))), N'Approved', 11, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 46, 5, N'Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -55, DATEADD(HOUR, -7, DATEADD(DAY, -23, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 47, 5, N'Giao hàng đóng xốp lưới từng quả rất kỹ, quả tươi nguyên cuống xanh. Đánh giá 5 sao!', DATEADD(MINUTE, -17, DATEADD(HOUR, -16, DATEADD(DAY, -46, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 47, 5, N'Tắc sành Bến Tre (Quất tươi) ngon lắm! Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -53, DATEADD(HOUR, -2, DATEADD(DAY, -69, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 48, 3, N'Trái cây độ tươi bình thường, quả không được đều nhau cho lắm, vị ngọt trung bình.', DATEADD(MINUTE, -24, DATEADD(HOUR, -23, DATEADD(DAY, -17, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 48, 4, N'Vị ngọt thanh tự nhiên, để tủ lạnh ăn mát lịm. Trừ nhẹ 1 sao vì vỏ hơi trầy xíu xiu bên ngoài.', DATEADD(MINUTE, -14, DATEADD(HOUR, -8, DATEADD(DAY, -37, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 49, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -1, DATEADD(HOUR, -1, DATEADD(DAY, -63, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 49, 4, N'Đóng gói cẩn thận, sản phẩm chất lượng. Sẽ tiếp tục mua ủng hộ bà con nông dân.', DATEADD(MINUTE, -6, DATEADD(HOUR, -13, DATEADD(DAY, -7, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 49, 3, N'Rau tươi vừa phải, vài lá ngoài hơi dập nhẹ do vận chuyển đường dài nhưng nhặt đi bên trong vẫn ngon.', DATEADD(MINUTE, -19, DATEADD(HOUR, -17, DATEADD(DAY, -50, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 50, 4, N'Đóng gói cẩn thận, sản phẩm chất lượng. Sẽ tiếp tục mua ủng hộ bà con nông dân.', DATEADD(MINUTE, -49, DATEADD(HOUR, -11, DATEADD(DAY, -13, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 50, 4, N'Cà chua beef hữu cơ ngon lắm! Đóng gói cẩn thận, sản phẩm chất lượng. Sẽ tiếp tục mua ủng hộ bà con nông dân.', DATEADD(MINUTE, -30, DATEADD(HOUR, -0, DATEADD(DAY, -38, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 51, 4, N'Việt quất tươi Đà Lạt ngon lắm! Trái cây tươi ngon, mọng nước. Quả hơi nhỏ hơn ảnh chụp một chút nhưng độ ngọt thì không chê được.', DATEADD(MINUTE, -21, DATEADD(HOUR, -5, DATEADD(DAY, -2, GETDATE()))), N'Approved', 11, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 51, 5, N'Giao hàng đóng xốp lưới từng quả rất kỹ, quả tươi nguyên cuống xanh. Đánh giá 5 sao!', DATEADD(MINUTE, -16, DATEADD(HOUR, -21, DATEADD(DAY, -66, GETDATE()))), N'Approved', 19, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 51, 3, N'Trái cây độ tươi bình thường, quả không được đều nhau cho lắm, vị ngọt trung bình.', DATEADD(MINUTE, -13, DATEADD(HOUR, -6, DATEADD(DAY, -4, GETDATE()))), N'Approved', 0, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 52, 5, N'Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -3, DATEADD(HOUR, -13, DATEADD(DAY, -33, GETDATE()))), N'Approved', 26, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 52, 4, N'Trái cây tươi ngon, mọng nước. Quả hơi nhỏ hơn ảnh chụp một chút nhưng độ ngọt thì không chê được.', DATEADD(MINUTE, -22, DATEADD(HOUR, -20, DATEADD(DAY, -30, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 53, 2, N'Có 1-2 quả bị cấn thâm một góc do chèn ép lúc giao hàng, mong bên vận chuyển cẩn thận hơn.', DATEADD(MINUTE, -29, DATEADD(HOUR, -5, DATEADD(DAY, -62, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 53, 5, N'Giao hàng đóng xốp lưới từng quả rất kỹ, quả tươi nguyên cuống xanh. Đánh giá 5 sao!', DATEADD(MINUTE, -58, DATEADD(HOUR, -13, DATEADD(DAY, -69, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 54, 4, N'Nho xanh Ninh Thuận ngon lắm! Đóng gói xốp bảo vệ chu đáo. Shipper giao đúng hẹn, trái cây ăn rất giòn và ngọt.', DATEADD(MINUTE, -18, DATEADD(HOUR, -12, DATEADD(DAY, -19, GETDATE()))), N'Approved', 4, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 54, 5, N'Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -28, DATEADD(HOUR, -23, DATEADD(DAY, -12, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 55, 4, N'Nấu canh rất ngọt nước, củ quả tươi. Nếu được giao sớm hơn vào buổi sáng thì tuyệt vời hơn.', DATEADD(MINUTE, -8, DATEADD(HOUR, -1, DATEADD(DAY, -17, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 55, 5, N'Nấm mối đen hữu cơ ngon lắm! Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -12, DATEADD(HOUR, -20, DATEADD(DAY, -60, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 55, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -51, DATEADD(HOUR, -16, DATEADD(DAY, -24, GETDATE()))), N'Approved', 8, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 56, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -1, DATEADD(HOUR, -7, DATEADD(DAY, -41, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 56, 4, N'Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -14, DATEADD(HOUR, -22, DATEADD(DAY, -38, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 57, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -32, DATEADD(HOUR, -16, DATEADD(DAY, -32, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 57, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -49, DATEADD(HOUR, -13, DATEADD(DAY, -62, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 58, 5, N'Nấm hương tươi Sapa ngon lắm! Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -29, DATEADD(HOUR, -16, DATEADD(DAY, -13, GETDATE()))), N'Approved', 11, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 58, 4, N'Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -53, DATEADD(HOUR, -18, DATEADD(DAY, -2, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 58, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -47, DATEADD(HOUR, -14, DATEADD(DAY, -21, GETDATE()))), N'Approved', 8, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 59, 4, N'Rau thơm và tươi, đọt non. Đóng gói cẩn thận. Giá hợp lý.', DATEADD(MINUTE, -45, DATEADD(HOUR, -11, DATEADD(DAY, -29, GETDATE()))), N'Approved', 11, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 59, 5, N'Rau thơm nức mũi, lá xanh mơn mởn không bị úa vàng lá nào. Cho vào bát phở thơm dậy mùi!', DATEADD(MINUTE, -23, DATEADD(HOUR, -6, DATEADD(DAY, -13, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 60, 4, N'Lá tươi xanh, mùi vị rất nồng nàn. Shipper giao nhanh.', DATEADD(MINUTE, -37, DATEADD(HOUR, -19, DATEADD(DAY, -72, GETDATE()))), N'Approved', 24, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 60, 5, N'Rau thơm sạch chuẩn hữu cơ, ăn sống yên tâm tuyệt đối.', DATEADD(MINUTE, -31, DATEADD(HOUR, -23, DATEADD(DAY, -47, GETDATE()))), N'Approved', 20, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 60, 4, N'Rau thơm và tươi, đọt non. Đóng gói cẩn thận. Giá hợp lý.', DATEADD(MINUTE, -9, DATEADD(HOUR, -13, DATEADD(DAY, -25, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 61, 5, N'Rau thơm nức mũi, lá xanh mơn mởn không bị úa vàng lá nào. Cho vào bát phở thơm dậy mùi!', DATEADD(MINUTE, -14, DATEADD(HOUR, -1, DATEADD(DAY, -13, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 61, 5, N'Tươi rói như vừa mới hái ở vườn vào, nhặt rất sạch sẽ hầu như không có cọng già.', DATEADD(MINUTE, -54, DATEADD(HOUR, -10, DATEADD(DAY, -11, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 61, 4, N'Lá tươi xanh, mùi vị rất nồng nàn. Shipper giao nhanh.', DATEADD(MINUTE, -56, DATEADD(HOUR, -1, DATEADD(DAY, -35, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1574316071802-0d684efa7cd5?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1608797178974-15b35a68d00d?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 62, 3, N'Độ tươi vừa phải, bảo quản tủ lạnh được khoảng 2 ngày.', DATEADD(MINUTE, -34, DATEADD(HOUR, -12, DATEADD(DAY, -49, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 62, 4, N'Rau thơm và tươi, đọt non. Đóng gói cẩn thận. Giá hợp lý.', DATEADD(MINUTE, -58, DATEADD(HOUR, -22, DATEADD(DAY, -74, GETDATE()))), N'Approved', 22, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 64, 5, N'Sản phẩm chất lượng vượt trội, hạt dẻo thơm không bị khô sượng. Đã giới thiệu cho bạn bè.', DATEADD(MINUTE, -1, DATEADD(HOUR, -19, DATEADD(DAY, -53, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 64, 5, N'Hạt sen tươi sấy giòn Đồng Tháp ngon lắm! Hạt mẩy đều, chắc nịch, không hề có hạt lép hay mốc. Nấu sữa hạt thơm béo ngậy!', DATEADD(MINUTE, -39, DATEADD(HOUR, -22, DATEADD(DAY, -6, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 64, 5, N'Hạt mẩy đều, chắc nịch, không hề có hạt lép hay mốc. Nấu sữa hạt thơm béo ngậy!', DATEADD(MINUTE, -58, DATEADD(HOUR, -23, DATEADD(DAY, -1, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 65, 3, N'Tạm ổn, ăn thơm bùi nhưng giá hơi cao so với mặt bằng chung.', DATEADD(MINUTE, -41, DATEADD(HOUR, -3, DATEADD(DAY, -32, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 65, 5, N'Rất đáng tiền, nguyên liệu sạch thuần tự nhiên tốt cho sức khỏe cả nhà.', DATEADD(MINUTE, -36, DATEADD(HOUR, -5, DATEADD(DAY, -9, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 65, 5, N'Đóng gói hút chân không dày dặn, hạt mới thu hoạch nên giữ nguyên mùi thơm đặc trưng.', DATEADD(MINUTE, -55, DATEADD(HOUR, -0, DATEADD(DAY, -33, GETDATE()))), N'Approved', 9, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 66, 5, N'Đậu phộng sẻ Củ Chi ngon lắm! Sản phẩm chất lượng vượt trội, hạt dẻo thơm không bị khô sượng. Đã giới thiệu cho bạn bè.', DATEADD(MINUTE, -59, DATEADD(HOUR, -15, DATEADD(DAY, -20, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 66, 5, N'Sản phẩm chất lượng vượt trội, hạt dẻo thơm không bị khô sượng. Đã giới thiệu cho bạn bè.', DATEADD(MINUTE, -8, DATEADD(HOUR, -15, DATEADD(DAY, -19, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 67, 5, N'Sản phẩm chất lượng vượt trội, hạt dẻo thơm không bị khô sượng. Đã giới thiệu cho bạn bè.', DATEADD(MINUTE, -39, DATEADD(HOUR, -0, DATEADD(DAY, -11, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 67, 1, N'Về Đậu xanh hạt tiêu sẻ Tây Bắc: Bao bì bị rách nhẹ làm rơi vãi một ít hạt ra ngoài trong lúc shipper vận chuyển.', DATEADD(MINUTE, -3, DATEADD(HOUR, -11, DATEADD(DAY, -36, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 68, 5, N'Đậu đen xanh lòng Tây Bắc ngon lắm! Rất đáng tiền, nguyên liệu sạch thuần tự nhiên tốt cho sức khỏe cả nhà.', DATEADD(MINUTE, -51, DATEADD(HOUR, -2, DATEADD(DAY, -9, GETDATE()))), N'Approved', 9, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 69, 2, N'Hạt có mùi hơi cũ một chút so với đợt trước, mong shop kiểm tra hạn xuất kho kỹ hơn.', DATEADD(MINUTE, -23, DATEADD(HOUR, -12, DATEADD(DAY, -11, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 69, 5, N'Hạt mè vàng tự nhiên (Vừng) ngon lắm! Đóng gói hút chân không dày dặn, hạt mới thu hoạch nên giữ nguyên mùi thơm đặc trưng.', DATEADD(MINUTE, -22, DATEADD(HOUR, -21, DATEADD(DAY, -25, GETDATE()))), N'Approved', 9, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 70, 5, N'Hạt chia hữu cơ tự nhiên ngon lắm! Sản phẩm chất lượng vượt trội, hạt dẻo thơm không bị khô sượng. Đã giới thiệu cho bạn bè.', DATEADD(MINUTE, -24, DATEADD(HOUR, -2, DATEADD(DAY, -9, GETDATE()))), N'Approved', 9, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 71, 5, N'Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -51, DATEADD(HOUR, -11, DATEADD(DAY, -31, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 72, 3, N'Về Cải cúc (Tần ô) Đà Lạt: Tạm hài lòng, sản phẩm sạch nhưng giá đợt này tăng nhẹ so với tuần trước.', DATEADD(MINUTE, -44, DATEADD(HOUR, -22, DATEADD(DAY, -61, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 72, 4, N'Cải cúc (Tần ô) Đà Lạt ngon lắm! Nấu canh rất ngọt nước, củ quả tươi. Nếu được giao sớm hơn vào buổi sáng thì tuyệt vời hơn.', DATEADD(MINUTE, -36, DATEADD(HOUR, -20, DATEADD(DAY, -68, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 73, 4, N'Xà lách Carol Đà Lạt ngon lắm! Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -43, DATEADD(HOUR, -11, DATEADD(DAY, -66, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 73, 4, N'Đóng gói cẩn thận, sản phẩm chất lượng. Sẽ tiếp tục mua ủng hộ bà con nông dân.', DATEADD(MINUTE, -4, DATEADD(HOUR, -13, DATEADD(DAY, -64, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 74, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -50, DATEADD(HOUR, -21, DATEADD(DAY, -13, GETDATE()))), N'Approved', 14, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 75, 5, N'Bắp cải trắng Đà Lạt ngon lắm! Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -32, DATEADD(HOUR, -4, DATEADD(DAY, -75, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 76, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -11, DATEADD(HOUR, -17, DATEADD(DAY, -57, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 76, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -52, DATEADD(HOUR, -18, DATEADD(DAY, -8, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 77, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -34, DATEADD(HOUR, -0, DATEADD(DAY, -34, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 78, 4, N'Bí xanh (Bí đao chanh) ngon lắm! Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -54, DATEADD(HOUR, -7, DATEADD(DAY, -6, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 78, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -5, DATEADD(HOUR, -16, DATEADD(DAY, -17, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 79, 3, N'Về Khổ qua (Mướp đắng) trái to: Chất lượng ở mức ổn, củ kích thước không đều nhau lắm nhưng ăn vẫn ngọt.', DATEADD(MINUTE, -53, DATEADD(HOUR, -7, DATEADD(DAY, -38, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 80, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -13, DATEADD(HOUR, -12, DATEADD(DAY, -37, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 80, 5, N'Cà tím dài Đà Lạt ngon lắm! Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -49, DATEADD(HOUR, -0, DATEADD(DAY, -68, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 81, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -2, DATEADD(HOUR, -3, DATEADD(DAY, -33, GETDATE()))), N'Approved', 4, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 81, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -31, DATEADD(HOUR, -3, DATEADD(DAY, -16, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 82, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -27, DATEADD(HOUR, -13, DATEADD(DAY, -22, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 83, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -24, DATEADD(HOUR, -20, DATEADD(DAY, -12, GETDATE()))), N'Approved', 19, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 83, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -51, DATEADD(HOUR, -2, DATEADD(DAY, -7, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 84, 3, N'Rau tươi vừa phải, vài lá ngoài hơi dập nhẹ do vận chuyển đường dài nhưng nhặt đi bên trong vẫn ngon.', DATEADD(MINUTE, -55, DATEADD(HOUR, -10, DATEADD(DAY, -28, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 85, 4, N'Củ sắn (Củ đậu) ngọt mát ngon lắm! Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -6, DATEADD(HOUR, -23, DATEADD(DAY, -44, GETDATE()))), N'Approved', 23, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 86, 4, N'Khoai môn sáp ruột tím ngon lắm! Nấu canh rất ngọt nước, củ quả tươi. Nếu được giao sớm hơn vào buổi sáng thì tuyệt vời hơn.', DATEADD(MINUTE, -59, DATEADD(HOUR, -12, DATEADD(DAY, -23, GETDATE()))), N'Approved', 0, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 87, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -44, DATEADD(HOUR, -8, DATEADD(DAY, -65, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 87, 4, N'Khoai sọ nếp Tây Bắc ngon lắm! Đóng gói cẩn thận, sản phẩm chất lượng. Sẽ tiếp tục mua ủng hộ bà con nông dân.', DATEADD(MINUTE, -4, DATEADD(HOUR, -9, DATEADD(DAY, -68, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 88, 3, N'Về Hành tây Đà Lạt: Tạm hài lòng, sản phẩm sạch nhưng giá đợt này tăng nhẹ so với tuần trước.', DATEADD(MINUTE, -50, DATEADD(HOUR, -3, DATEADD(DAY, -22, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 88, 3, N'Chất lượng ở mức ổn, củ kích thước không đều nhau lắm nhưng ăn vẫn ngọt.', DATEADD(MINUTE, -40, DATEADD(HOUR, -19, DATEADD(DAY, -54, GETDATE()))), N'Approved', 1, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 89, 4, N'Nấm rơm tươi quê ngon lắm! Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -25, DATEADD(HOUR, -1, DATEADD(DAY, -30, GETDATE()))), N'Approved', 8, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 90, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -40, DATEADD(HOUR, -13, DATEADD(DAY, -41, GETDATE()))), N'Approved', 2, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 91, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -29, DATEADD(HOUR, -2, DATEADD(DAY, -19, GETDATE()))), N'Approved', 7, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 92, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -39, DATEADD(HOUR, -1, DATEADD(DAY, -61, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 93, 2, N'Rau thơm bị giập hơi nhiều trong túi nilon, shop nên đóng hộp nhựa để bảo vệ rau thơm tốt hơn.', DATEADD(MINUTE, -51, DATEADD(HOUR, -18, DATEADD(DAY, -1, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 93, 5, N'Ngò gai (Mùi tàu) tươi ngon lắm! Rau thơm sạch chuẩn hữu cơ, ăn sống yên tâm tuyệt đối.', DATEADD(MINUTE, -27, DATEADD(HOUR, -20, DATEADD(DAY, -53, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 94, 5, N'Rau thơm nức mũi, lá xanh mơn mởn không bị úa vàng lá nào. Cho vào bát phở thơm dậy mùi!', DATEADD(MINUTE, -31, DATEADD(HOUR, -9, DATEADD(DAY, -59, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 95, 5, N'Mùi tinh dầu tự nhiên rất đậm đà, đóng gói khay sạch sẽ dễ bảo quản trong ngăn mát tủ lạnh.', DATEADD(MINUTE, -33, DATEADD(HOUR, -20, DATEADD(DAY, -56, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 95, 4, N'Lá tươi xanh, mùi vị rất nồng nàn. Shipper giao nhanh.', DATEADD(MINUTE, -9, DATEADD(HOUR, -7, DATEADD(DAY, -70, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 96, 3, N'Rau thơm nhưng bó hơi nhỏ so với cảm nhận, có vài ngọn bị thâm nhẹ.', DATEADD(MINUTE, -31, DATEADD(HOUR, -18, DATEADD(DAY, -9, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 97, 5, N'Rau thơm nức mũi, lá xanh mơn mởn không bị úa vàng lá nào. Cho vào bát phở thơm dậy mùi!', DATEADD(MINUTE, -18, DATEADD(HOUR, -19, DATEADD(DAY, -25, GETDATE()))), N'Approved', 19, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1574316071802-0d684efa7cd5?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 98, 4, N'Lá tươi xanh, mùi vị rất nồng nàn. Shipper giao nhanh.', DATEADD(MINUTE, -28, DATEADD(HOUR, -7, DATEADD(DAY, -61, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 99, 4, N'Rau thơm và tươi, đọt non. Đóng gói cẩn thận. Giá hợp lý.', DATEADD(MINUTE, -22, DATEADD(HOUR, -6, DATEADD(DAY, -17, GETDATE()))), N'Approved', 27, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 100, 5, N'Ớt sừng đỏ tươi ngon lắm! Mùi tinh dầu tự nhiên rất đậm đà, đóng gói khay sạch sẽ dễ bảo quản trong ngăn mát tủ lạnh.', DATEADD(MINUTE, -5, DATEADD(HOUR, -16, DATEADD(DAY, -30, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 100, 5, N'Ớt sừng đỏ tươi ngon lắm! Mùi tinh dầu tự nhiên rất đậm đà, đóng gói khay sạch sẽ dễ bảo quản trong ngăn mát tủ lạnh.', DATEADD(MINUTE, -51, DATEADD(HOUR, -2, DATEADD(DAY, -69, GETDATE()))), N'Approved', 19, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 101, 1, N'Rau bị dập úng khi nhận hàng do thời gian giao kéo dài.', DATEADD(MINUTE, -2, DATEADD(HOUR, -3, DATEADD(DAY, -21, GETDATE()))), N'Approved', 2, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();
COMMIT TRANSACTION;
PRINT N'SUCCESS: Seeded reviews successfully!';