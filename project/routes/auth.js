var express = require("express");
var router = express.Router();
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcryptjs");

router.post("/Register", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    const users = await DButils.execQuery(
      "SELECT username FROM dbo.Users"
    );

    if (users.find((x) => x.username === req.body.username))
      throw { status: 409, message: "Username taken." };

    //hash the password
    let hash_password = bcrypt.hashSync(
      req.body.password,
      parseInt(process.env.bcrypt_saltRounds)
    );
    req.body.password = hash_password;

    // add the new username
    await DButils.execQuery(
      `INSERT INTO dbo.Users (Username, Password, Permissions) VALUES ('${req.body.username}', '${hash_password}', 0)`
    );
    res.status(201).send("User created successfully.");
  } catch (error) {
    next(error);
  }
});

router.post("/Login", async (req, res, next) => {
  try {
    const user = (
      await DButils.execQuery(
        `SELECT * FROM dbo.Users WHERE Username = '${req.body.username}'`
      )
    )[0];
    // user = user[0];

    // check that username exists & the password is correct
    if (!user || !bcrypt.compareSync(req.body.password, user.Password)) {
      throw { status: 401, message: "Incorrect username or password." };
    }

    // Set cookie
    req.session.username = user.Username;

    // return cookie
    res.status(200).send("Login succeeded.");
  } catch (error) {
    next(error);
  }
});

router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "Logout succeeded." });
});

module.exports = router;
