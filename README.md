#Mô tả
Hệ thống đi chợ tiện lợi được thiết kế nhằm hỗ trợ người dùng trong việc lập kế hoạch mua
sắm, quản lý thực phẩm trong tủ lạnh và lên thực đơn hàng ngày. Mục tiêu của hệ thống là giúp người
dùng duy trì thói quen tiêu dùng hiệu quả, giảm thiểu lãng phí thực phẩm và đảm bảo dinh dưỡng hợp
lý.
Hệ thống cung cấp các công cụ quản lý danh sách mua sắm, theo dõi hạn sử dụng thực phẩm,
đề xuất món ăn từ nguyên liệu sẵn có, cũng như hỗ trợ xây dựng kế hoạch bữa ăn theo tuần. Ngoài
ra, hệ thống cho phép các thành viên trong gia đình chia sẻ thông tin mua sắm và phân công nhiệm
vụ, giúp tối ưu hóa quá trình đi chợ và sử dụng thực phẩm.

-----------------------------------
Sau khi pull hoặc download file zip và giải nén
mở folder lên 
tạo file .env trong folder be cùng cấp với app.js và nhập :
-------------------------------------
MONGO_URI=mongodb+srv://chiennth225602:aavM2vL8NVqUoD6R@cluster0.zyeqztw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0S
JWT_SECRET=dmleduc
JWT_EXPIRES_IN=3600s
----------------------------------------------------------------------
mở terminal:
cd be
npm install
docker-compose up --build
--------------------------------------------
mở 1 terminal khác:
---------------------------------
cd fe 
npm install
npm run dev
---------------------------------
    "email": "nija3@example.com",
    "password": "StrongPassword!123"
dang nhap tai khoan de test cac chuc nang co san
