const {
  login,
  register,
  getAllUsers,
  setAvatar,
  logOut,
} = require("../controllers/userController");

const router = require("express").Router();

// Test route to verify routing is working
router.get("/test", (req, res) => {
  res.json({ 
    message: "Auth routes are working!", 
    routes: {
      login: "POST /api/auth/login",
      register: "POST /api/auth/register",
      getAllUsers: "GET /api/auth/allusers/:id",
      setAvatar: "POST /api/auth/setavatar/:id",
      logout: "GET /api/auth/logout/:id"
    }
  });
});

router.post("/login", login);
router.post("/register", register);
router.get("/allusers/:id", getAllUsers);
router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);

module.exports = router;
