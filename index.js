const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});
app.post("/users/",async(request,response)=>{
    try {
        const {username,gender,location,name,password}=request.body;
        const hashedpassword=await bcrypt.hash(password,20);
        // checking user exist or not with the username
        const checkUserquery=`
        select *
        from user
        where username='${username}';`;
        const userresult=await db.get(checkUserquery);
        if(userresult===undefined)
        {
            const createUserQuery=`
            insert into user(username,name,password,gender,location)
            values('${username}','${name}','${hashedpassword}','${gender}','${location}');
            `;
            await db.run(createUserQuery);
            response.send("User created Successfully");
        }
        else
        {
            response.status(400);
            response.send("User already exists");
        }
    } catch (error) {
        console.log(error);
    }
});

app.post("/login/",async(request,response)=>{
    const {username,password}=request.body;
    const checkuserquery=`
    select *
    from user
    where username='${username}';`;
    const result=await db.get(checkuserquery);
    if(result===undefined)
    {
        response.status(400);
        response.send("invalid User");
    }
    else
    {
        // now check and compare the passwords
        const passwordcheck=await bcrypt.compare(password,result.password);
        if(passwordcheck)
        {
            response.send("Login Success");
        }
        else{
            response.status(400);
            response.send("Invalid login");
        }
    }
});

