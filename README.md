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
