# cafe routes

### GET "/workers/all" => barcha ishchini olish

### GET "/workers/:id" => 1 ta ishchini olish \_id da beriladi

### POST "/workers/create" => {

    {
        "fullname": "Bahromjon Ismoilov",
        "phone": "+79876543211",
        "password": "admin123",
        "login": "admin123",
        "role": "admin",
        "salary": 5000,
    }

}

### POST "/login

    {
        "login":"admin123",
        "password":"admin123"
    }

### DELETE "/workers/delete/:id" => \_id beriladi

### PUT "/workers/update/:id", => \_id beriladi

### PUT "/workers/status/:id", => aktive || noaktive qilish uchun \_id beriladi boshqa narsa kerak emas avtomatik true || false boladi
