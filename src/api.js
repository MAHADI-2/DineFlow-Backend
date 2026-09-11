import express from "express";
const router = express.Router();
import { logout } from "./Logout/logOutController.js";
import { AUTH } from "../src/midleware/Authentication/AUTH.js";
import { isAdmin } from "../src/midleware/Authentication/AUTH.js";

import  {registerController} from "./userService&controller/userController.js";
import { verifyOtpController } from "./OTP/otpController.js"
import {loginController} from "./Login/loginController.js";

import { MenuController,getMenuContrioller,UpdateMenuController,deleteMenuController,addReviewController,uploadMenuImageController} from "./MenuService&Cnotroller/MenuController.js";

import {createOrderController,placeOrderController
    ,markAsPaidController,getOrderDetailsController,getAllOrdersByUserController,
    getAllOrdersController,updateOrderPaymentStatusController,deleteOrderController,cancelOrderController
} from "./OrderService&controller/oderController.js";

import {paymentSuccessController,
 paymentFailController,
 paymentCancelController,
 ipnController} from "./Payment/paymentController.js";

 import {updateProfilePicController} from "./ProfilePic/picController.js";
 import upload from "./midleware/upload.js";
import { getProfileController, updateProfileController } from "./UpdateProfile/updateProfileController.js";
 import { forgotPasswordController, resetPasswordController } from "./ForgotPassword/forgotPasswordController.js";
import { createTableBookingController, getAllTableBookingsController, getMyTableBookingsController, updateTableBookingController } from "./TableBooking/tableBookingController.js";

router.post("/createUser",registerController);
router.post("/verifyOtp",verifyOtpController)
router.post("/login",loginController);
router.post("/forgotPassword", forgotPasswordController);
router.post("/resetPassword", resetPasswordController);
router.post("/profilePic", AUTH, upload.single("file"), updateProfilePicController);
router.get("/profile", AUTH, getProfileController);
router.put("/updateProfile", AUTH, updateProfileController);
router.post("/logout", AUTH, logout);



router.post("/createMenu", AUTH, isAdmin, MenuController)
router.post("/menu/:menuItemId/review", AUTH, addReviewController);
router.get("/getMenu",getMenuContrioller)
router.post("/uploadMenuImage", AUTH, isAdmin, upload.single("file"), uploadMenuImageController)
router.put("/updateMenu/:menu_id", AUTH, isAdmin, UpdateMenuController)
router.delete("/deleteMenu/:menu_id", AUTH, isAdmin, deleteMenuController)



router.post("/createOrder", AUTH, isAdmin, createOrderController)



router.post("/placeOrder", AUTH, placeOrderController)



router.post("/payment/success/:orderId", paymentSuccessController);
router.get("/payment/success/:orderId", paymentSuccessController);
router.post("/payment/fail/:orderId", paymentFailController);
router.get("/payment/fail/:orderId", paymentFailController);
router.post("/payment/cancel/:orderId", paymentCancelController);
router.get("/payment/cancel/:orderId", paymentCancelController);
router.post("/payment/ipn", ipnController);

router.get("/orderDetails/:orderId", AUTH, getOrderDetailsController);
router.delete("/cancelOrder/:orderId", AUTH, cancelOrderController)
router.delete("/deleteOrder/:orderId", AUTH, isAdmin, deleteOrderController)
router.get("/orders/",AUTH, getAllOrdersByUserController);
router.get("/allOrders", AUTH, isAdmin, getAllOrdersController);
router.put("/updateOrder/:orderId/", AUTH, isAdmin, updateOrderPaymentStatusController);


router.put("/order/:orderId/mark-paid", AUTH, isAdmin, markAsPaidController);

router.post("/tableBookings", AUTH, createTableBookingController);
router.get("/tableBookings/mine", AUTH, getMyTableBookingsController);
router.get("/tableBookings", AUTH, isAdmin, getAllTableBookingsController);
router.patch("/tableBookings/:bookingId", AUTH, isAdmin, updateTableBookingController);



export default router;