const User = require("../model/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        //console.log("Request body:", req.body);

        // Check if username exists
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck) {
            return res.json({ message: "Username already exists", status: false });
        }

        // Check if email exists
        const emailCheck = await User.findOne({ email });
        if (emailCheck) {
            return res.json({ message: "Email already exists", status: false });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({ 
            username, 
            email, 
            password: hashedPassword 
        });

        // Remove password from the response
        const userWithoutPassword = { ...user._doc };
        delete userWithoutPassword.password;

        return res.json({ status: true, user: userWithoutPassword });
    } catch (ex) {
        console.error("Error in register function:", ex);
        next(ex);
    }
};

module.exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ message: "Incorrect username or password", status: false });
        }

        const isPasswordVaild = await bcrypt.compare(password, user.password)
        if (!isPasswordVaild) {
            return res.json({ message: "Incorrect username or password", status: false});
        }

        // Remove password from the response
        const userWithoutPassword = { ...user._doc };
        delete userWithoutPassword.password;

        return res.json({ status: true, user: userWithoutPassword });
    } catch (ex) {
        console.error("Error in register function:", ex);
        next(ex);
    }
};

module.exports.setAvatar = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const avatarImage = req.body.image;
        const userData = await User.findByIdAndUpdate(userId, {
            isAvaterImageSet: true,
            avatarImage,
        });
        return res.json({ 
            isSet: userData.isAvaterImageSet,
            image: userData.avatarImage
        });
        } catch (ex) {
            console.error("Error in setAvatar function:", ex);
            next(ex);
            }
}

module.exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $ne: req.params._id } }).select([
            "email",
            "username",
            "avatarImage",
            "_id"
        ]);
        return res.json(users);
    } catch (ex) {
        next(ex)
    } 
}

module.exports.logOut = (req, res, next) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        // Missing user ID in the request
        return res.status(400).json({ status: false, msg: "User ID is required" });
      }
  
      if (!onlineUsers.has(id)) {
        // User not found in the `onlineUsers` map
        return res.status(404).json({ status: false, msg: "User not found in online users" });
      }
  
      // Remove the user from the `onlineUsers` map
      onlineUsers.delete(id);
  
      // Respond with success
      return res.status(200).json({ status: true, msg: "Logged out successfully" });
    } catch (ex) {
      console.error("Error in logOut function:", ex);
  
      // Send a generic server error response
      return res.status(500).json({ status: false, msg: "An error occurred during logout" });
    }
  };
  