"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const authRouter = (0, express_1.Router)();
authRouter.post('/register', authController_1.register);
authRouter.post('/login', authController_1.login);
authRouter.post('/logout', authController_1.logout);
authRouter.post('/refresh-token', authController_1.refreshToken);
authRouter.post('/vendor/onboard', auth_1.requireAuth, authController_1.onboardVendor);
authRouter.get('/me', auth_1.requireAuth, authController_1.me);
exports.default = authRouter;
//# sourceMappingURL=auth.routes.js.map