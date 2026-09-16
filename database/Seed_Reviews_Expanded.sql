-- SEED EXPANDED REVIEWS SCRIPT (TARGET ~75% COVERAGE)
USE QL_WebMuaBanNongSan;
SET NOCOUNT ON;
BEGIN TRANSACTION;
DELETE FROM ReviewHelpfulVotes WHERE ReviewId >= 11;
DELETE FROM ReviewImages WHERE ReviewId >= 11;
DELETE FROM Reviews WHERE ReviewId >= 11;
DBCC CHECKIDENT ('Reviews', RESEED, 10);
DBCC CHECKIDENT ('ReviewImages', RESEED, 4);
DECLARE @NewReviewId BIGINT;

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 6, 4, N'Nấu canh rất ngọt nước, củ quả tươi. Nếu được giao sớm hơn vào buổi sáng thì tuyệt vời hơn.', DATEADD(MINUTE, -22, DATEADD(HOUR, -12, DATEADD(DAY, -7, GETDATE()))), N'Approved', 27, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 6, 4, N'Nấu canh rất ngọt nước, củ quả tươi. Nếu được giao sớm hơn vào buổi sáng thì tuyệt vời hơn.', DATEADD(MINUTE, -7, DATEADD(HOUR, -4, DATEADD(DAY, -38, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 6, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -24, DATEADD(HOUR, -18, DATEADD(DAY, -9, GETDATE()))), N'Approved', 11, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 6, 4, N'Đóng gói cẩn thận, sản phẩm chất lượng. Sẽ tiếp tục mua ủng hộ bà con nông dân.', DATEADD(MINUTE, -41, DATEADD(HOUR, -12, DATEADD(DAY, -45, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 6, 4, N'Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -0, DATEADD(HOUR, -5, DATEADD(DAY, -21, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 6, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -8, DATEADD(HOUR, -16, DATEADD(DAY, -35, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 7, 5, N'Rau thơm sạch chuẩn hữu cơ, ăn sống yên tâm tuyệt đối.', DATEADD(MINUTE, -6, DATEADD(HOUR, -2, DATEADD(DAY, -33, GETDATE()))), N'Approved', 11, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 7, 5, N'Rau thơm nức mũi, lá xanh mơn mởn không bị úa vàng lá nào. Cho vào bát phở thơm dậy mùi!', DATEADD(MINUTE, -54, DATEADD(HOUR, -20, DATEADD(DAY, -40, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1608797178974-15b35a68d00d?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 7, 2, N'Về Ngò rí: Rau thơm bị giập hơi nhiều trong túi nilon, shop nên đóng hộp nhựa để bảo vệ rau thơm tốt hơn.', DATEADD(MINUTE, -32, DATEADD(HOUR, -8, DATEADD(DAY, -75, GETDATE()))), N'Approved', 4, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 7, 5, N'Rau thơm sạch chuẩn hữu cơ, ăn sống yên tâm tuyệt đối.', DATEADD(MINUTE, -17, DATEADD(HOUR, -7, DATEADD(DAY, -29, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 12, 3, N'Về Ổi nữ hoàng: Trái cây độ tươi bình thường, quả không được đều nhau cho lắm, vị ngọt trung bình.', DATEADD(MINUTE, -54, DATEADD(HOUR, -16, DATEADD(DAY, -13, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 12, 4, N'Trái cây tươi ngon, mọng nước. Quả hơi nhỏ hơn ảnh chụp một chút nhưng độ ngọt thì không chê được.', DATEADD(MINUTE, -12, DATEADD(HOUR, -20, DATEADD(DAY, -66, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 12, 4, N'Đóng gói xốp bảo vệ chu đáo. Shipper giao đúng hẹn, trái cây ăn rất giòn và ngọt.', DATEADD(MINUTE, -29, DATEADD(HOUR, -16, DATEADD(DAY, -68, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 12, 5, N'Ổi nữ hoàng ngon lắm! Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -24, DATEADD(HOUR, -18, DATEADD(DAY, -74, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 12, 5, N'Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -25, DATEADD(HOUR, -13, DATEADD(DAY, -59, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 15, 2, N'Về Cải ngọt VietGAP: Bị dập một góc dưới đáy túi do chèn ép lúc vận chuyển. Mong shop cải thiện khâu đóng thùng.', DATEADD(MINUTE, -28, DATEADD(HOUR, -7, DATEADD(DAY, -20, GETDATE()))), N'Approved', 3, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 15, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -5, DATEADD(HOUR, -19, DATEADD(DAY, -6, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 15, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -54, DATEADD(HOUR, -6, DATEADD(DAY, -74, GETDATE()))), N'Approved', 12, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 15, 5, N'Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -49, DATEADD(HOUR, -18, DATEADD(DAY, -45, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 15, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -56, DATEADD(HOUR, -4, DATEADD(DAY, -62, GETDATE()))), N'Approved', 7, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 16, 5, N'Cải ngồng Mộc Châu ngon lắm! Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -8, DATEADD(HOUR, -18, DATEADD(DAY, -58, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 16, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -37, DATEADD(HOUR, -23, DATEADD(DAY, -19, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 16, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -24, DATEADD(HOUR, -8, DATEADD(DAY, -19, GETDATE()))), N'Approved', 19, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 16, 4, N'Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -3, DATEADD(HOUR, -9, DATEADD(DAY, -28, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 17, 5, N'Rau dền đỏ Miền Tây ngon lắm! Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -21, DATEADD(HOUR, -1, DATEADD(DAY, -71, GETDATE()))), N'Approved', 6, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 17, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -49, DATEADD(HOUR, -20, DATEADD(DAY, -47, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 17, 1, N'Về Rau dền đỏ Miền Tây: Giao hàng hơi chậm làm rau dập nát nhiều, may mà nhân viên chăm sóc khách hàng hỗ trợ đổi trả nhiệt tình.', DATEADD(MINUTE, -19, DATEADD(HOUR, -10, DATEADD(DAY, -40, GETDATE()))), N'Approved', 2, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 17, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -33, DATEADD(HOUR, -23, DATEADD(DAY, -39, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 17, 2, N'Rau đến nơi hơi héo vì thời tiết nắng nóng, shop nên bọc thêm túi giữ lạnh trong mùa hè.', DATEADD(MINUTE, -33, DATEADD(HOUR, -7, DATEADD(DAY, -70, GETDATE()))), N'Approved', 1, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 18, 5, N'Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -4, DATEADD(HOUR, -9, DATEADD(DAY, -15, GETDATE()))), N'Approved', 12, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 18, 4, N'Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -50, DATEADD(HOUR, -4, DATEADD(DAY, -33, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 18, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -23, DATEADD(HOUR, -14, DATEADD(DAY, -25, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 18, 4, N'Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -10, DATEADD(HOUR, -19, DATEADD(DAY, -44, GETDATE()))), N'Approved', 20, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 18, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -33, DATEADD(HOUR, -4, DATEADD(DAY, -61, GETDATE()))), N'Approved', 8, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 20, 5, N'Rau càng cua tự nhiên ngon lắm! Rau thơm nức mũi, lá xanh mơn mởn không bị úa vàng lá nào. Cho vào bát phở thơm dậy mùi!', DATEADD(MINUTE, -6, DATEADD(HOUR, -15, DATEADD(DAY, -21, GETDATE()))), N'Approved', 11, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 20, 5, N'Rau thơm sạch chuẩn hữu cơ, ăn sống yên tâm tuyệt đối.', DATEADD(MINUTE, -2, DATEADD(HOUR, -8, DATEADD(DAY, -27, GETDATE()))), N'Approved', 6, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 20, 3, N'Độ tươi vừa phải, bảo quản tủ lạnh được khoảng 2 ngày.', DATEADD(MINUTE, -2, DATEADD(HOUR, -2, DATEADD(DAY, -67, GETDATE()))), N'Approved', 0, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1574316071802-0d684efa7cd5?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 20, 4, N'Lá tươi xanh, mùi vị rất nồng nàn. Shipper giao nhanh.', DATEADD(MINUTE, -42, DATEADD(HOUR, -12, DATEADD(DAY, -18, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 20, 5, N'Mùi tinh dầu tự nhiên rất đậm đà, đóng gói khay sạch sẽ dễ bảo quản trong ngăn mát tủ lạnh.', DATEADD(MINUTE, -40, DATEADD(HOUR, -5, DATEADD(DAY, -73, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 21, 5, N'Rau ngót Nhật sạch ngon lắm! Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -21, DATEADD(HOUR, -4, DATEADD(DAY, -18, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 21, 3, N'Tạm hài lòng, sản phẩm sạch nhưng giá đợt này tăng nhẹ so với tuần trước.', DATEADD(MINUTE, -29, DATEADD(HOUR, -6, DATEADD(DAY, -9, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 21, 5, N'Rau ngót Nhật sạch ngon lắm! Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -21, DATEADD(HOUR, -14, DATEADD(DAY, -25, GETDATE()))), N'Approved', 9, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 21, 4, N'Đóng gói cẩn thận, sản phẩm chất lượng. Sẽ tiếp tục mua ủng hộ bà con nông dân.', DATEADD(MINUTE, -25, DATEADD(HOUR, -5, DATEADD(DAY, -7, GETDATE()))), N'Approved', 5, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 21, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -7, DATEADD(HOUR, -16, DATEADD(DAY, -10, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 22, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -28, DATEADD(HOUR, -14, DATEADD(DAY, -25, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 22, 4, N'Đọt bí non Mộc Châu ngon lắm! Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -59, DATEADD(HOUR, -15, DATEADD(DAY, -18, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 22, 5, N'Đọt bí non Mộc Châu ngon lắm! Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -47, DATEADD(HOUR, -14, DATEADD(DAY, -67, GETDATE()))), N'Approved', 1, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 22, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -54, DATEADD(HOUR, -0, DATEADD(DAY, -6, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 22, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -54, DATEADD(HOUR, -5, DATEADD(DAY, -22, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 22, 4, N'Đọt bí non Mộc Châu ngon lắm! Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -8, DATEADD(HOUR, -12, DATEADD(DAY, -65, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 24, 3, N'Về Củ dền đỏ Đà Lạt: Chất lượng ở mức ổn, củ kích thước không đều nhau lắm nhưng ăn vẫn ngọt.', DATEADD(MINUTE, -16, DATEADD(HOUR, -22, DATEADD(DAY, -44, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 24, 4, N'Đóng gói cẩn thận, sản phẩm chất lượng. Sẽ tiếp tục mua ủng hộ bà con nông dân.', DATEADD(MINUTE, -58, DATEADD(HOUR, -19, DATEADD(DAY, -68, GETDATE()))), N'Approved', 15, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 24, 5, N'Củ dền đỏ Đà Lạt ngon lắm! Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -3, DATEADD(HOUR, -8, DATEADD(DAY, -68, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 24, 5, N'Củ dền đỏ Đà Lạt ngon lắm! Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -1, DATEADD(HOUR, -4, DATEADD(DAY, -20, GETDATE()))), N'Approved', 16, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 24, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -35, DATEADD(HOUR, -7, DATEADD(DAY, -60, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 26, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -8, DATEADD(HOUR, -13, DATEADD(DAY, -48, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 26, 5, N'Bầu sao Miền Tây ngon lắm! Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -19, DATEADD(HOUR, -7, DATEADD(DAY, -59, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 26, 4, N'Đóng gói cẩn thận, sản phẩm chất lượng. Sẽ tiếp tục mua ủng hộ bà con nông dân.', DATEADD(MINUTE, -56, DATEADD(HOUR, -22, DATEADD(DAY, -55, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 26, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -39, DATEADD(HOUR, -1, DATEADD(DAY, -56, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 27, 5, N'Mướp hương đồng quê ngon lắm! Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -6, DATEADD(HOUR, -14, DATEADD(DAY, -12, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 27, 5, N'Mướp hương đồng quê ngon lắm! Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -37, DATEADD(HOUR, -0, DATEADD(DAY, -65, GETDATE()))), N'Approved', 2, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 27, 5, N'Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -28, DATEADD(HOUR, -17, DATEADD(DAY, -59, GETDATE()))), N'Approved', 7, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 27, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -24, DATEADD(HOUR, -6, DATEADD(DAY, -3, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 27, 2, N'Rau đến nơi hơi héo vì thời tiết nắng nóng, shop nên bọc thêm túi giữ lạnh trong mùa hè.', DATEADD(MINUTE, -31, DATEADD(HOUR, -15, DATEADD(DAY, -58, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 29, 3, N'Rau tươi vừa phải, vài lá ngoài hơi dập nhẹ do vận chuyển đường dài nhưng nhặt đi bên trong vẫn ngon.', DATEADD(MINUTE, -38, DATEADD(HOUR, -12, DATEADD(DAY, -53, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 29, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -59, DATEADD(HOUR, -18, DATEADD(DAY, -52, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 29, 5, N'Đậu bắp baby xanh ngon lắm! Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -19, DATEADD(HOUR, -9, DATEADD(DAY, -57, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 29, 5, N'Đậu bắp baby xanh ngon lắm! Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -22, DATEADD(HOUR, -18, DATEADD(DAY, -40, GETDATE()))), N'Approved', 9, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 29, 3, N'Rau tươi vừa phải, vài lá ngoài hơi dập nhẹ do vận chuyển đường dài nhưng nhặt đi bên trong vẫn ngon.', DATEADD(MINUTE, -48, DATEADD(HOUR, -7, DATEADD(DAY, -69, GETDATE()))), N'Approved', 0, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 30, 4, N'Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -30, DATEADD(HOUR, -1, DATEADD(DAY, -35, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 30, 5, N'Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -39, DATEADD(HOUR, -3, DATEADD(DAY, -5, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 30, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -7, DATEADD(HOUR, -1, DATEADD(DAY, -65, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 30, 5, N'Su hào Mộc Châu ngon lắm! Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -1, DATEADD(HOUR, -3, DATEADD(DAY, -39, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 31, 4, N'Củ cải trắng hữu cơ ngon lắm! Đóng gói cẩn thận, sản phẩm chất lượng. Sẽ tiếp tục mua ủng hộ bà con nông dân.', DATEADD(MINUTE, -11, DATEADD(HOUR, -21, DATEADD(DAY, -61, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 31, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -32, DATEADD(HOUR, -20, DATEADD(DAY, -67, GETDATE()))), N'Approved', 16, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 32, 4, N'Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -14, DATEADD(HOUR, -17, DATEADD(DAY, -56, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 32, 4, N'Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -28, DATEADD(HOUR, -18, DATEADD(DAY, -16, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 33, 5, N'Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -6, DATEADD(HOUR, -19, DATEADD(DAY, -11, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 33, 2, N'Về Sầu riêng Ri6 Bến Tre: Có 1-2 quả bị cấn thâm một góc do chèn ép lúc giao hàng, mong bên vận chuyển cẩn thận hơn.', DATEADD(MINUTE, -46, DATEADD(HOUR, -11, DATEADD(DAY, -52, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 33, 5, N'Sầu riêng Ri6 Bến Tre ngon lắm! Chất lượng xuất sắc, đúng cam kết quả to đều đẹp, mua biếu tặng hoặc ăn đều rất sang trọng.', DATEADD(MINUTE, -2, DATEADD(HOUR, -11, DATEADD(DAY, -54, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 34, 5, N'Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -12, DATEADD(HOUR, -0, DATEADD(DAY, -49, GETDATE()))), N'Approved', 14, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 34, 5, N'Trái cây cực kỳ ngọt và mọng nước, mùi thơm lừng khắp phòng khi vừa bóc hộp ra.', DATEADD(MINUTE, -50, DATEADD(HOUR, -17, DATEADD(DAY, -57, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 35, 5, N'Măng cụt Lái Thiêu ngon lắm! Trái cây cực kỳ ngọt và mọng nước, mùi thơm lừng khắp phòng khi vừa bóc hộp ra.', DATEADD(MINUTE, -36, DATEADD(HOUR, -1, DATEADD(DAY, -69, GETDATE()))), N'Approved', 18, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 35, 5, N'Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -42, DATEADD(HOUR, -12, DATEADD(DAY, -62, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 35, 5, N'Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -39, DATEADD(HOUR, -8, DATEADD(DAY, -56, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 36, 5, N'Chôm chôm nhãn Tiền Giang ngon lắm! Chất lượng xuất sắc, đúng cam kết quả to đều đẹp, mua biếu tặng hoặc ăn đều rất sang trọng.', DATEADD(MINUTE, -46, DATEADD(HOUR, -23, DATEADD(DAY, -7, GETDATE()))), N'Approved', 13, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 36, 4, N'Trái cây tươi ngon, mọng nước. Quả hơi nhỏ hơn ảnh chụp một chút nhưng độ ngọt thì không chê được.', DATEADD(MINUTE, -4, DATEADD(HOUR, -13, DATEADD(DAY, -67, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 36, 1, N'Giao nhầm loại trái cây so với đơn mình đặt, tuy nhiên shop đã chủ động xin lỗi và hoàn tiền nhanh.', DATEADD(MINUTE, -39, DATEADD(HOUR, -16, DATEADD(DAY, -21, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 37, 3, N'Ăn được nhưng chưa xuất sắc như kỳ vọng so với mức giá này.', DATEADD(MINUTE, -1, DATEADD(HOUR, -18, DATEADD(DAY, -72, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 37, 4, N'Mận hậu Bắc Hà ngon lắm! Trái cây tươi ngon, mọng nước. Quả hơi nhỏ hơn ảnh chụp một chút nhưng độ ngọt thì không chê được.', DATEADD(MINUTE, -29, DATEADD(HOUR, -0, DATEADD(DAY, -18, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 38, 2, N'Độ ngọt chưa tới, trái cây còn hơi non cuống nên ăn chưa đượm vị.', DATEADD(MINUTE, -43, DATEADD(HOUR, -2, DATEADD(DAY, -20, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 38, 4, N'Nhãn xuồng cơm vàng Vũng Tàu ngon lắm! Đóng gói xốp bảo vệ chu đáo. Shipper giao đúng hẹn, trái cây ăn rất giòn và ngọt.', DATEADD(MINUTE, -48, DATEADD(HOUR, -17, DATEADD(DAY, -14, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 39, 3, N'Về Đu đủ ruột đỏ tự nhiên: Ăn được nhưng chưa xuất sắc như kỳ vọng so với mức giá này.', DATEADD(MINUTE, -57, DATEADD(HOUR, -1, DATEADD(DAY, -56, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 39, 4, N'Đu đủ ruột đỏ tự nhiên ngon lắm! Trái cây tươi ngon, mọng nước. Quả hơi nhỏ hơn ảnh chụp một chút nhưng độ ngọt thì không chê được.', DATEADD(MINUTE, -35, DATEADD(HOUR, -21, DATEADD(DAY, -73, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 40, 4, N'Dưa lưới Taki Nhật Bản ngon lắm! Vị ngọt thanh tự nhiên, để tủ lạnh ăn mát lịm. Trừ nhẹ 1 sao vì vỏ hơi trầy xíu xiu bên ngoài.', DATEADD(MINUTE, -5, DATEADD(HOUR, -12, DATEADD(DAY, -4, GETDATE()))), N'Approved', 8, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 40, 5, N'Giao hàng đóng xốp lưới từng quả rất kỹ, quả tươi nguyên cuống xanh. Đánh giá 5 sao!', DATEADD(MINUTE, -33, DATEADD(HOUR, -3, DATEADD(DAY, -46, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 40, 3, N'Ăn được nhưng chưa xuất sắc như kỳ vọng so với mức giá này.', DATEADD(MINUTE, -20, DATEADD(HOUR, -19, DATEADD(DAY, -32, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 41, 5, N'Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -50, DATEADD(HOUR, -9, DATEADD(DAY, -74, GETDATE()))), N'Approved', 8, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 41, 5, N'Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -32, DATEADD(HOUR, -9, DATEADD(DAY, -19, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 42, 5, N'Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -32, DATEADD(HOUR, -2, DATEADD(DAY, -43, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 42, 4, N'Vị ngọt thanh tự nhiên, để tủ lạnh ăn mát lịm. Trừ nhẹ 1 sao vì vỏ hơi trầy xíu xiu bên ngoài.', DATEADD(MINUTE, -58, DATEADD(HOUR, -19, DATEADD(DAY, -57, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 43, 5, N'Na dai Đồng Mỏ Chi Lăng ngon lắm! Trái cây cực kỳ ngọt và mọng nước, mùi thơm lừng khắp phòng khi vừa bóc hộp ra.', DATEADD(MINUTE, -5, DATEADD(HOUR, -15, DATEADD(DAY, -56, GETDATE()))), N'Approved', 9, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 43, 5, N'Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -21, DATEADD(HOUR, -7, DATEADD(DAY, -35, GETDATE()))), N'Approved', 24, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 43, 5, N'Giao hàng đóng xốp lưới từng quả rất kỹ, quả tươi nguyên cuống xanh. Đánh giá 5 sao!', DATEADD(MINUTE, -38, DATEADD(HOUR, -15, DATEADD(DAY, -28, GETDATE()))), N'Approved', 10, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 44, 2, N'Độ ngọt chưa tới, trái cây còn hơi non cuống nên ăn chưa đượm vị.', DATEADD(MINUTE, -0, DATEADD(HOUR, -18, DATEADD(DAY, -30, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 44, 4, N'Vị ngọt thanh tự nhiên, để tủ lạnh ăn mát lịm. Trừ nhẹ 1 sao vì vỏ hơi trầy xíu xiu bên ngoài.', DATEADD(MINUTE, -45, DATEADD(HOUR, -0, DATEADD(DAY, -71, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 44, 5, N'Mít tố nữ Miền Tây ngon lắm! Trái cây cực kỳ ngọt và mọng nước, mùi thơm lừng khắp phòng khi vừa bóc hộp ra.', DATEADD(MINUTE, -10, DATEADD(HOUR, -5, DATEADD(DAY, -13, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 45, 5, N'Trái cây cực kỳ ngọt và mọng nước, mùi thơm lừng khắp phòng khi vừa bóc hộp ra.', DATEADD(MINUTE, -15, DATEADD(HOUR, -3, DATEADD(DAY, -43, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 45, 5, N'Quýt hồng Lai Vung ngon lắm! Chất lượng xuất sắc, đúng cam kết quả to đều đẹp, mua biếu tặng hoặc ăn đều rất sang trọng.', DATEADD(MINUTE, -29, DATEADD(HOUR, -8, DATEADD(DAY, -32, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 46, 5, N'Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -1, DATEADD(HOUR, -11, DATEADD(DAY, -58, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 46, 2, N'Có 1-2 quả bị cấn thâm một góc do chèn ép lúc giao hàng, mong bên vận chuyển cẩn thận hơn.', DATEADD(MINUTE, -43, DATEADD(HOUR, -3, DATEADD(DAY, -17, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 46, 5, N'Chất lượng xuất sắc, đúng cam kết quả to đều đẹp, mua biếu tặng hoặc ăn đều rất sang trọng.', DATEADD(MINUTE, -7, DATEADD(HOUR, -18, DATEADD(DAY, -41, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 47, 3, N'Về Tắc sành Bến Tre (Quất tươi): Trái cây độ tươi bình thường, quả không được đều nhau cho lắm, vị ngọt trung bình.', DATEADD(MINUTE, -31, DATEADD(HOUR, -21, DATEADD(DAY, -27, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 47, 5, N'Giao hàng đóng xốp lưới từng quả rất kỹ, quả tươi nguyên cuống xanh. Đánh giá 5 sao!', DATEADD(MINUTE, -47, DATEADD(HOUR, -20, DATEADD(DAY, -44, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 48, 5, N'Trái cây cực kỳ ngọt và mọng nước, mùi thơm lừng khắp phòng khi vừa bóc hộp ra.', DATEADD(MINUTE, -10, DATEADD(HOUR, -13, DATEADD(DAY, -10, GETDATE()))), N'Approved', 3, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 48, 3, N'Trái cây độ tươi bình thường, quả không được đều nhau cho lắm, vị ngọt trung bình.', DATEADD(MINUTE, -32, DATEADD(HOUR, -1, DATEADD(DAY, -2, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 48, 2, N'Có 1-2 quả bị cấn thâm một góc do chèn ép lúc giao hàng, mong bên vận chuyển cẩn thận hơn.', DATEADD(MINUTE, -25, DATEADD(HOUR, -17, DATEADD(DAY, -70, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 49, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -18, DATEADD(HOUR, -2, DATEADD(DAY, -19, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 49, 5, N'Cà chua socola Đà Lạt ngon lắm! Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -49, DATEADD(HOUR, -14, DATEADD(DAY, -22, GETDATE()))), N'Approved', 11, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 50, 1, N'Về Cà chua beef hữu cơ: Giao hàng hơi chậm làm rau dập nát nhiều, may mà nhân viên chăm sóc khách hàng hỗ trợ đổi trả nhiệt tình.', DATEADD(MINUTE, -54, DATEADD(HOUR, -11, DATEADD(DAY, -50, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 50, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -53, DATEADD(HOUR, -19, DATEADD(DAY, -68, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 50, 5, N'Cà chua beef hữu cơ ngon lắm! Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -27, DATEADD(HOUR, -3, DATEADD(DAY, -35, GETDATE()))), N'Approved', 6, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 51, 5, N'Vị ngọt thanh dịu mát, không hề gắt cổ. Cả nhà mình ai cũng khen nức nở.', DATEADD(MINUTE, -32, DATEADD(HOUR, -4, DATEADD(DAY, -63, GETDATE()))), N'Approved', 5, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 51, 5, N'Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -29, DATEADD(HOUR, -9, DATEADD(DAY, -17, GETDATE()))), N'Approved', 21, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 51, 3, N'Trái cây độ tươi bình thường, quả không được đều nhau cho lắm, vị ngọt trung bình.', DATEADD(MINUTE, -2, DATEADD(HOUR, -14, DATEADD(DAY, -67, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 52, 5, N'Phúc bồn tử đen (Mâm xôi) ngon lắm! Bổ quả ra ruột vàng óng, thơm nức mũi. Ăn vào mát lòng mát dạ trong những ngày nắng nóng.', DATEADD(MINUTE, -3, DATEADD(HOUR, -6, DATEADD(DAY, -7, GETDATE()))), N'Approved', 9, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 52, 4, N'Phúc bồn tử đen (Mâm xôi) ngon lắm! Đóng gói xốp bảo vệ chu đáo. Shipper giao đúng hẹn, trái cây ăn rất giòn và ngọt.', DATEADD(MINUTE, -5, DATEADD(HOUR, -2, DATEADD(DAY, -5, GETDATE()))), N'Approved', 8, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 53, 5, N'Vị ngọt thanh dịu mát, không hề gắt cổ. Cả nhà mình ai cũng khen nức nở.', DATEADD(MINUTE, -26, DATEADD(HOUR, -20, DATEADD(DAY, -60, GETDATE()))), N'Approved', 8, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 53, 5, N'Dâu tằm tươi Đà Lạt ngon lắm! Chất lượng xuất sắc, đúng cam kết quả to đều đẹp, mua biếu tặng hoặc ăn đều rất sang trọng.', DATEADD(MINUTE, -29, DATEADD(HOUR, -1, DATEADD(DAY, -41, GETDATE()))), N'Approved', 22, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 53, 5, N'Dâu tằm tươi Đà Lạt ngon lắm! Quả chín cây tự nhiên, không bị úng hay dập. Vỏ mỏng thịt dày hạt nhỏ, ăn rất đã miệng!', DATEADD(MINUTE, -46, DATEADD(HOUR, -14, DATEADD(DAY, -30, GETDATE()))), N'Approved', 8, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 54, 5, N'Chất lượng xuất sắc, đúng cam kết quả to đều đẹp, mua biếu tặng hoặc ăn đều rất sang trọng.', DATEADD(MINUTE, -23, DATEADD(HOUR, -19, DATEADD(DAY, -12, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 54, 5, N'Trái cây cực kỳ ngọt và mọng nước, mùi thơm lừng khắp phòng khi vừa bóc hộp ra.', DATEADD(MINUTE, -52, DATEADD(HOUR, -7, DATEADD(DAY, -58, GETDATE()))), N'Approved', 10, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 55, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -19, DATEADD(HOUR, -5, DATEADD(DAY, -18, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 55, 5, N'Nấm mối đen hữu cơ ngon lắm! Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -42, DATEADD(HOUR, -20, DATEADD(DAY, -65, GETDATE()))), N'Approved', 13, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 56, 4, N'Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -12, DATEADD(HOUR, -20, DATEADD(DAY, -10, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 56, 4, N'Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -57, DATEADD(HOUR, -22, DATEADD(DAY, -59, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 56, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -15, DATEADD(HOUR, -20, DATEADD(DAY, -61, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 57, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -45, DATEADD(HOUR, -17, DATEADD(DAY, -64, GETDATE()))), N'Approved', 2, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 57, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -39, DATEADD(HOUR, -3, DATEADD(DAY, -20, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 58, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -39, DATEADD(HOUR, -23, DATEADD(DAY, -69, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 58, 4, N'Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -49, DATEADD(HOUR, -0, DATEADD(DAY, -21, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 58, 2, N'Bị dập một góc dưới đáy túi do chèn ép lúc vận chuyển. Mong shop cải thiện khâu đóng thùng.', DATEADD(MINUTE, -29, DATEADD(HOUR, -16, DATEADD(DAY, -26, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 59, 5, N'Rau thơm sạch chuẩn hữu cơ, ăn sống yên tâm tuyệt đối.', DATEADD(MINUTE, -10, DATEADD(HOUR, -3, DATEADD(DAY, -67, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1608797178974-15b35a68d00d?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 59, 4, N'Hành lá tươi gốc to ngon lắm! Rau thơm và tươi, đọt non. Đóng gói cẩn thận. Giá hợp lý.', DATEADD(MINUTE, -13, DATEADD(HOUR, -19, DATEADD(DAY, -67, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 60, 4, N'Lá tươi xanh, mùi vị rất nồng nàn. Shipper giao nhanh.', DATEADD(MINUTE, -37, DATEADD(HOUR, -21, DATEADD(DAY, -71, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 60, 5, N'Húng quế thơm hữu cơ ngon lắm! Rau thơm sạch chuẩn hữu cơ, ăn sống yên tâm tuyệt đối.', DATEADD(MINUTE, -5, DATEADD(HOUR, -13, DATEADD(DAY, -46, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 60, 5, N'Mùi tinh dầu tự nhiên rất đậm đà, đóng gói khay sạch sẽ dễ bảo quản trong ngăn mát tủ lạnh.', DATEADD(MINUTE, -36, DATEADD(HOUR, -10, DATEADD(DAY, -1, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 61, 1, N'Về Gừng sẻ đồi Tây Bắc: Rau bị dập úng khi nhận hàng do thời gian giao kéo dài.', DATEADD(MINUTE, -44, DATEADD(HOUR, -16, DATEADD(DAY, -56, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 61, 5, N'Tươi rói như vừa mới hái ở vườn vào, nhặt rất sạch sẽ hầu như không có cọng già.', DATEADD(MINUTE, -31, DATEADD(HOUR, -7, DATEADD(DAY, -35, GETDATE()))), N'Approved', 2, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 62, 4, N'Rau thơm và tươi, đọt non. Đóng gói cẩn thận. Giá hợp lý.', DATEADD(MINUTE, -38, DATEADD(HOUR, -12, DATEADD(DAY, -52, GETDATE()))), N'Approved', 14, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 62, 5, N'Tươi rói như vừa mới hái ở vườn vào, nhặt rất sạch sẽ hầu như không có cọng già.', DATEADD(MINUTE, -1, DATEADD(HOUR, -18, DATEADD(DAY, -28, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 64, 5, N'Đóng gói hút chân không dày dặn, hạt mới thu hoạch nên giữ nguyên mùi thơm đặc trưng.', DATEADD(MINUTE, -13, DATEADD(HOUR, -20, DATEADD(DAY, -13, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 64, 5, N'Sản phẩm chất lượng vượt trội, hạt dẻo thơm không bị khô sượng. Đã giới thiệu cho bạn bè.', DATEADD(MINUTE, -21, DATEADD(HOUR, -4, DATEADD(DAY, -21, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 65, 5, N'Hạt macca nứt vỏ Lâm Đồng ngon lắm! Nấm tươi dai giòn sần sật, nấu canh sườn hay lẩu nấm ngọt lịm tự nhiên.', DATEADD(MINUTE, -52, DATEADD(HOUR, -8, DATEADD(DAY, -23, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 65, 5, N'Hạt macca nứt vỏ Lâm Đồng ngon lắm! Đóng gói hút chân không dày dặn, hạt mới thu hoạch nên giữ nguyên mùi thơm đặc trưng.', DATEADD(MINUTE, -2, DATEADD(HOUR, -20, DATEADD(DAY, -32, GETDATE()))), N'Approved', 17, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 66, 5, N'Sản phẩm chất lượng vượt trội, hạt dẻo thơm không bị khô sượng. Đã giới thiệu cho bạn bè.', DATEADD(MINUTE, -30, DATEADD(HOUR, -22, DATEADD(DAY, -7, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 66, 4, N'Đậu phộng sẻ Củ Chi ngon lắm! Chất lượng tốt, nấu nhanh mềm và bùi béo. Đóng gói lịch sự.', DATEADD(MINUTE, -9, DATEADD(HOUR, -10, DATEADD(DAY, -14, GETDATE()))), N'Approved', 6, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 67, 4, N'Chất lượng tốt, nấu nhanh mềm và bùi béo. Đóng gói lịch sự.', DATEADD(MINUTE, -38, DATEADD(HOUR, -12, DATEADD(DAY, -4, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 67, 3, N'Chất lượng hạt ở mức khá, có lẫn một ít hạt kích thước không đồng đều.', DATEADD(MINUTE, -23, DATEADD(HOUR, -11, DATEADD(DAY, -42, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 68, 4, N'Chất lượng tốt, nấu nhanh mềm và bùi béo. Đóng gói lịch sự.', DATEADD(MINUTE, -13, DATEADD(HOUR, -0, DATEADD(DAY, -57, GETDATE()))), N'Approved', 18, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 69, 5, N'Hạt mè vàng tự nhiên (Vừng) ngon lắm! Nấm tươi dai giòn sần sật, nấu canh sườn hay lẩu nấm ngọt lịm tự nhiên.', DATEADD(MINUTE, -46, DATEADD(HOUR, -21, DATEADD(DAY, -10, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 69, 4, N'Chất lượng tốt, nấu nhanh mềm và bùi béo. Đóng gói lịch sự.', DATEADD(MINUTE, -25, DATEADD(HOUR, -10, DATEADD(DAY, -57, GETDATE()))), N'Approved', 1, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 70, 5, N'Đóng gói hút chân không dày dặn, hạt mới thu hoạch nên giữ nguyên mùi thơm đặc trưng.', DATEADD(MINUTE, -6, DATEADD(HOUR, -12, DATEADD(DAY, -29, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (13, 70, 5, N'Rất đáng tiền, nguyên liệu sạch thuần tự nhiên tốt cho sức khỏe cả nhà.', DATEADD(MINUTE, -37, DATEADD(HOUR, -10, DATEADD(DAY, -59, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 71, 4, N'Rau dền xanh non ngon lắm! Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -57, DATEADD(HOUR, -21, DATEADD(DAY, -23, GETDATE()))), N'Approved', 10, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 71, 5, N'Rau dền xanh non ngon lắm! Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -58, DATEADD(HOUR, -22, DATEADD(DAY, -5, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 72, 5, N'Cải cúc (Tần ô) Đà Lạt ngon lắm! Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -38, DATEADD(HOUR, -8, DATEADD(DAY, -66, GETDATE()))), N'Approved', 8, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 73, 5, N'Độ tươi ngon tuyệt đối, chuẩn vị nông sản vườn Đà Lạt. Đã mua nhiều lần và lần nào cũng ưng ý.', DATEADD(MINUTE, -21, DATEADD(HOUR, -22, DATEADD(DAY, -64, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 74, 3, N'Rau tươi vừa phải, vài lá ngoài hơi dập nhẹ do vận chuyển đường dài nhưng nhặt đi bên trong vẫn ngon.', DATEADD(MINUTE, -15, DATEADD(HOUR, -15, DATEADD(DAY, -60, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (12, 74, 3, N'Chất lượng ở mức ổn, củ kích thước không đều nhau lắm nhưng ăn vẫn ngọt.', DATEADD(MINUTE, -14, DATEADD(HOUR, -23, DATEADD(DAY, -68, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 75, 4, N'Nấu canh rất ngọt nước, củ quả tươi. Nếu được giao sớm hơn vào buổi sáng thì tuyệt vời hơn.', DATEADD(MINUTE, -36, DATEADD(HOUR, -0, DATEADD(DAY, -43, GETDATE()))), N'Approved', 10, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 76, 2, N'Bị dập một góc dưới đáy túi do chèn ép lúc vận chuyển. Mong shop cải thiện khâu đóng thùng.', DATEADD(MINUTE, -15, DATEADD(HOUR, -16, DATEADD(DAY, -9, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 76, 3, N'Chất lượng ở mức ổn, củ kích thước không đều nhau lắm nhưng ăn vẫn ngọt.', DATEADD(MINUTE, -8, DATEADD(HOUR, -1, DATEADD(DAY, -67, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 77, 5, N'Cà chua thường quê ngon lắm! Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -48, DATEADD(HOUR, -4, DATEADD(DAY, -26, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (16, 77, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -21, DATEADD(HOUR, -16, DATEADD(DAY, -11, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 78, 5, N'Bí xanh (Bí đao chanh) ngon lắm! Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -4, DATEADD(HOUR, -6, DATEADD(DAY, -3, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 79, 5, N'Khổ qua (Mướp đắng) trái to ngon lắm! Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -34, DATEADD(HOUR, -19, DATEADD(DAY, -46, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (19, 80, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -49, DATEADD(HOUR, -16, DATEADD(DAY, -69, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 80, 3, N'Rau tươi vừa phải, vài lá ngoài hơi dập nhẹ do vận chuyển đường dài nhưng nhặt đi bên trong vẫn ngon.', DATEADD(MINUTE, -53, DATEADD(HOUR, -3, DATEADD(DAY, -22, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 81, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -57, DATEADD(HOUR, -5, DATEADD(DAY, -74, GETDATE()))), N'Approved', 14, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 81, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -45, DATEADD(HOUR, -5, DATEADD(DAY, -6, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 82, 1, N'Về Khoai tây hồng Đà Lạt: Giao hàng hơi chậm làm rau dập nát nhiều, may mà nhân viên chăm sóc khách hàng hỗ trợ đổi trả nhiệt tình.', DATEADD(MINUTE, -25, DATEADD(HOUR, -7, DATEADD(DAY, -8, GETDATE()))), N'Approved', 0, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 83, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -39, DATEADD(HOUR, -11, DATEADD(DAY, -13, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 83, 5, N'Rau tươi xanh mởn, không hề bị dập lá nào. Nấu canh hay xào tỏi đều ngọt nước tự nhiên.', DATEADD(MINUTE, -37, DATEADD(HOUR, -11, DATEADD(DAY, -61, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 84, 2, N'Về Khoai lang tím Nhật: Bị dập một góc dưới đáy túi do chèn ép lúc vận chuyển. Mong shop cải thiện khâu đóng thùng.', DATEADD(MINUTE, -30, DATEADD(HOUR, -13, DATEADD(DAY, -12, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (6, 85, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -51, DATEADD(HOUR, -16, DATEADD(DAY, -70, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 86, 4, N'Khoai môn sáp ruột tím ngon lắm! Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -1, DATEADD(HOUR, -6, DATEADD(DAY, -20, GETDATE()))), N'Approved', 20, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 87, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -18, DATEADD(HOUR, -10, DATEADD(DAY, -46, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (10, 87, 5, N'Đóng gói hút chân không/lót giấy giữ ẩm rất cẩn thận. Giao xe lạnh đến tay vẫn còn sương tươi rói.', DATEADD(MINUTE, -16, DATEADD(HOUR, -14, DATEADD(DAY, -44, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 88, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -13, DATEADD(HOUR, -17, DATEADD(DAY, -6, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 88, 5, N'Sản phẩm sạch đạt chuẩn VietGAP, ngâm rửa thấy không hề có cặn bùn bẩn, yên tâm cho cả gia đình.', DATEADD(MINUTE, -36, DATEADD(HOUR, -5, DATEADD(DAY, -33, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 89, 5, N'Rau giòn ngọt, vị thanh mát đặc trưng. Bé nhà mình rất lười ăn rau mà nấu món này bé ăn sạch bát.', DATEADD(MINUTE, -7, DATEADD(HOUR, -15, DATEADD(DAY, -24, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 89, 4, N'Nấu canh rất ngọt nước, củ quả tươi. Nếu được giao sớm hơn vào buổi sáng thì tuyệt vời hơn.', DATEADD(MINUTE, -18, DATEADD(HOUR, -16, DATEADD(DAY, -13, GETDATE()))), N'Approved', 0, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 90, 4, N'Chất lượng tốt, giòn ngọt. Giá có hơi cao hơn chợ truyền thống một chút nhưng đảm bảo sạch là ok.', DATEADD(MINUTE, -14, DATEADD(HOUR, -16, DATEADD(DAY, -69, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 91, 4, N'Rau rất tươi, đóng gói gọn gàng. Shipper giao hơi trễ một chút nhưng rau vẫn giữ được độ tươi tốt.', DATEADD(MINUTE, -32, DATEADD(HOUR, -10, DATEADD(DAY, -58, GETDATE()))), N'Approved', 5, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 91, 1, N'Giao hàng hơi chậm làm rau dập nát nhiều, may mà nhân viên chăm sóc khách hàng hỗ trợ đổi trả nhiệt tình.', DATEADD(MINUTE, -21, DATEADD(HOUR, -1, DATEADD(DAY, -27, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 92, 5, N'Bắp non (Ngô bao tử) ngon lắm! Củ quả chắc nịch, đều quả, gọt vỏ không bị sâu hay hà. Rất đáng đồng tiền!', DATEADD(MINUTE, -12, DATEADD(HOUR, -15, DATEADD(DAY, -49, GETDATE()))), N'Approved', 4, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (7, 93, 5, N'Ngò gai (Mùi tàu) tươi ngon lắm! Tươi rói như vừa mới hái ở vườn vào, nhặt rất sạch sẽ hầu như không có cọng già.', DATEADD(MINUTE, -11, DATEADD(HOUR, -2, DATEADD(DAY, -54, GETDATE()))), N'Approved', 12, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 93, 5, N'Mùi tinh dầu tự nhiên rất đậm đà, đóng gói khay sạch sẽ dễ bảo quản trong ngăn mát tủ lạnh.', DATEADD(MINUTE, -51, DATEADD(HOUR, -12, DATEADD(DAY, -36, GETDATE()))), N'Approved', 25, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (17, 94, 5, N'Tươi rói như vừa mới hái ở vườn vào, nhặt rất sạch sẽ hầu như không có cọng già.', DATEADD(MINUTE, -0, DATEADD(HOUR, -1, DATEADD(DAY, -38, GETDATE()))), N'Approved', 3, 0, 0);
SET @NewReviewId = SCOPE_IDENTITY();
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1574316071802-0d684efa7cd5?w=600&auto=format&fit=crop&q=80');
INSERT INTO ReviewImages (ReviewId, ImageUrl) VALUES (@NewReviewId, 'https://images.unsplash.com/photo-1608797178974-15b35a68d00d?w=600&auto=format&fit=crop&q=80');

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (14, 95, 4, N'Lá tươi xanh, mùi vị rất nồng nàn. Shipper giao nhanh.', DATEADD(MINUTE, -57, DATEADD(HOUR, -17, DATEADD(DAY, -41, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 95, 5, N'Rau thơm sạch chuẩn hữu cơ, ăn sống yên tâm tuyệt đối.', DATEADD(MINUTE, -52, DATEADD(HOUR, -13, DATEADD(DAY, -34, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 96, 3, N'Độ tươi vừa phải, bảo quản tủ lạnh được khoảng 2 ngày.', DATEADD(MINUTE, -21, DATEADD(HOUR, -9, DATEADD(DAY, -66, GETDATE()))), N'Approved', 2, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (5, 96, 3, N'Độ tươi vừa phải, bảo quản tủ lạnh được khoảng 2 ngày.', DATEADD(MINUTE, -37, DATEADD(HOUR, -0, DATEADD(DAY, -10, GETDATE()))), N'Approved', 3, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (18, 97, 5, N'Tươi rói như vừa mới hái ở vườn vào, nhặt rất sạch sẽ hầu như không có cọng già.', DATEADD(MINUTE, -22, DATEADD(HOUR, -1, DATEADD(DAY, -56, GETDATE()))), N'Approved', 9, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (15, 98, 4, N'Rau thơm và tươi, đọt non. Đóng gói cẩn thận. Giá hợp lý.', DATEADD(MINUTE, -13, DATEADD(HOUR, -0, DATEADD(DAY, -1, GETDATE()))), N'Approved', 7, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (9, 99, 5, N'Rau thơm sạch chuẩn hữu cơ, ăn sống yên tâm tuyệt đối.', DATEADD(MINUTE, -44, DATEADD(HOUR, -17, DATEADD(DAY, -51, GETDATE()))), N'Approved', 15, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (11, 100, 3, N'Về Ớt sừng đỏ tươi: Độ tươi vừa phải, bảo quản tủ lạnh được khoảng 2 ngày.', DATEADD(MINUTE, -13, DATEADD(HOUR, -18, DATEADD(DAY, -2, GETDATE()))), N'Approved', 1, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();

INSERT INTO Reviews (CustomerId, ProductId, Rating, Comment, CreatedAt, Status, HelpfulCount, ReportCount, IsPurchased)
VALUES (8, 101, 4, N'Tỏi cô đơn Lý Sơn ngon lắm! Lá tươi xanh, mùi vị rất nồng nàn. Shipper giao nhanh.', DATEADD(MINUTE, -21, DATEADD(HOUR, -15, DATEADD(DAY, -33, GETDATE()))), N'Approved', 27, 0, 1);
SET @NewReviewId = SCOPE_IDENTITY();
COMMIT TRANSACTION;
PRINT N'SUCCESS: Seeded reviews successfully!';