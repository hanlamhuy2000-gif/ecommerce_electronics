import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

const users = [
  {
    name: "Quản Trị Viên (Admin)",
    email: "admin@gmail.com",
    password: "Password123@",
    role: "admin",
    verified: true,
    status: "active",
    phone: "0900000001",
    address: "Hà Nội, Việt Nam",
  },
  {
    name: "Người Bán Hàng (Seller)",
    email: "seller@gmail.com",
    password: "Password123@",
    role: "seller",
    verified: true,
    status: "active",
    phone: "0900000002",
    address: "Đà Nẵng, Việt Nam",
  },
  {
    name: "Khách Hàng (Customer)",
    email: "customer@gmail.com",
    password: "Password123@",
    role: "customer",
    verified: true,
    status: "active",
    phone: "0900000003",
    address: "Hồ Chí Minh, Việt Nam",
  },
  {
    name: "Nhân Viên Giao Hàng (Shipper)",
    email: "shipper@gmail.com",
    password: "Password123@",
    role: "shipper",
    verified: true,
    status: "active",
    phone: "0900000004",
    address: "Cần Thơ, Việt Nam",
  },
  {
    name: "Quản Lý Kho (Warehouse)",
    email: "warehouse@gmail.com",
    password: "Password123@",
    role: "warehouse",
    verified: true,
    status: "active",
    phone: "0900000005",
    address: "Hải Phòng, Việt Nam",
  },
];

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI không tồn tại trong file .env!");
      process.exit(1);
    }

    console.log("Đang kết nối MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Đã kết nối MongoDB.");

    for (const u of users) {
      const existingUser = await User.findOne({ email: u.email });
      if (existingUser) {
        existingUser.name = u.name;
        existingUser.password = u.password; // pre('save') hook sẽ hash
        existingUser.role = u.role;
        existingUser.verified = u.verified;
        existingUser.status = u.status;
        existingUser.phone = u.phone;
        existingUser.address = u.address;
        await existingUser.save();
        console.log(`Đã cập nhật tài khoản: ${u.email} [${u.role}]`);
      } else {
        await User.create(u);
        console.log(`Đã tạo mới tài khoản: ${u.email} [${u.role}]`);
      }
    }

    console.log("\n=======================================================");
    console.log(" TẠO SEED DATA TÀI KHOẢN THÀNH CÔNG!");
    console.log("=======================================================");
    console.log("Mật khẩu chung cho tất cả tài khoản: Password123@\n");
    users.forEach((u) => {
      console.log(`- Role: ${u.role.padEnd(10)} | Email: ${u.email.padEnd(22)} | Tên: ${u.name}`);
    });
    console.log("=======================================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi seed data:", error);
    process.exit(1);
  }
};

seedUsers();

