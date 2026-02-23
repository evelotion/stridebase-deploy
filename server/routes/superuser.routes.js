

import express from "express";
import {
  authenticateToken,
  checkRole,
} from "../middleware/authenticateToken.js";
import {
  getGlobalConfig,
  updateGlobalConfig,
  reseedDatabase,
  getApprovalRequests,
  resolveApprovalRequest,
  getSecurityLogs,
  updateHomePageTheme,
  uploadDeveloperAsset,
 
} from "../controllers/superuser.controller.js";
import multer from "multer";


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.use(authenticateToken, checkRole(["developer"]));


router.get("/config", getGlobalConfig);
router.post("/config", updateGlobalConfig);


router.get("/approval-requests", getApprovalRequests);
router.post("/approval-requests/:id/resolve", resolveApprovalRequest);


router.get("/security-logs", getSecurityLogs);


router.post("/maintenance/reseed-database", reseedDatabase);



router.put("/settings/homepage-theme", updateHomePageTheme);

router.post("/upload-asset", upload.single("asset"), uploadDeveloperAsset);



export default router;