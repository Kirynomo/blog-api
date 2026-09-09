Blog API -
day 4 august 
Started with mongoose models - user, post and comments. Omitted likes and bookmark models from the og plan. apparently there can be 10 to 50 models in a production MERN app which is crazy. Now onto JWT signup , login, logout, refresh, and auth middleware routes.
testing the signup route but it ain't working. hopscotch keeps loading forever

day 5 august
Fixed yesterdays issue. there were some typos in the app.js file which were causing the problem. now its working. On to the next route - login. Testing a login but it says incorrect password or email means my bcrypt thing is failing. Figured this out, it was the bcrypt function that expects plain text argument first then the hashed one, it worked after switching the positions in the argument lol.

day 6 august
working on refresh route and a testing a dummy protected route. I get nothing in the response just an empty {} req.user.name or email everything gives empty object lmao . this was so silly, i forgot 'await' when i did fingById for user. thats why it was empty lol. Tested the refresh route: logged in and took the refresh token from there, waited for it to expire then sent the refreshtoken on /refresh to get new accessToken for the user, using req.headers since cookie thing doesn't work in hopscotch and then retired the dummy protected route with new access token that came from refresh. working well ! im forgetting await in mongoose quesries and keep getting weird ahh errors. Also new thing i learned was const refreshToken = refreshHeader.split(" ")[1]; here i thought it separates the token bcus the full token has dots in between and has 3 parts but this actually separates the keyword Bearer from token like this ["Bearer", "abc.xyz.123"].
Testing the logout route and it was fgiving user.save aint a function but it really is. apparently again it was getting a promise thats why bcus i hadn't used await. 
Promise { <pending> }
another bug - cookies got cleared but refresh token was still visible in the database cus i was putting the wrong one in auth header to fixed that as well. pushed all changes to GitHub

day 10 august
Created the get post, get all posts, create post route with user verification. Also tested them and they are working properly in hopscotch. Later in the night tired using the populate method of mongoose to get appropriate details in response but only half of the json is being sent! Fixed this issue. it was caused by res.json bcus res.json can send only 1 thing not two objects. If u combine them into one still wont work bcus of duplicate keys. So use map() function inside res.json.

day 13th august 
had table tennis match on 11th and was lowk chilling outside on 12th aug (so fun). had populated author in /get posts but was feeling fishy about the populate cus the password, refreshtoken and all were also being retrieved by the server (not used) so asked gpt about it and figured out that my intuition was right hehehe. the cleaner implementation is to tell Mongoose to populate only the author's name: .populate("author", "name -_id")
the /get showAllPosts route only shows all the posts of the logged in user but this is supposed to be a one for all thing no matter who logs in, fixed it by removing the filtering field by author: req.user._id and used the basic find({}).
worked and figured out the /patch post/:id request. Imp point is that when comparing object ids if == is used then it compares the reference to it so it will return false even if values are the same so always use .equals() for ownership check. 
/delete post/:id also working well

create, delete, and edit comment is working well with proper ownership checks. Post model doesn't show comments but comments have a ref to post model -> 
One parent → potentially MANY child documents
and those child documents are substantial/independent entities like eg a post having 50k comments so instead put the parent's ID on the child.


day 14th august
So worked on the /getAllPosts route with populated comments. It wud have been easier if it was a two way referencing but it was comment -> post so had to populate post with user, comment with user then for each post map its comments ({post: post._id}), then return everything properly, with again mapping comments since we shall get an array.
The response is proper with comments key showing an array of comment with content and author.
syntax doubt : everything inside these parentheses is an object that I want to return.
(comment) => ({
  comment: comment.content,
  owner: comment.owner.name,
})

is basically shorthand for:

(comment) => {
  return {
    comment: comment.content,
    owner: comment.owner.name,
  };
}

day 15th august
Learned about pagination since I had to implement it in this project, the limit offset method using a normal function and a middleware through medium and coreUI articles.
implemented pagination in a new route (practice route that returns all posts without userVerfication or login). The page division depends on limit. if limit is 2 then the total items are divided into 2 pages each and if page = 3 so data in the 3rd page is returned which is gonna be 2 items. From mongoose, .limit() and .skip() functions are used to do so. Next task is to implement it as a middleware with max and default limits.
const posts = await Post.find({}, { title: 1, content: 1, tags: 1 })
Since post id, author id from User model was also retrieved, I used the field projection i learned in DBMS practical in college! 
Coded the middleware, joined the routes and edited the controller to make it make sense but hopscotch kept loading indefinetly so gpt said paginate middleware needs () this and my object i created was req.pagination in the mw while i accessed req.paginate in my controller. Now its working properly.
Realized that I populated author and comments for get /posts but it was to be done for only get /post/:id 


day 21st august
populated comments, comment author and post owner for the showPost controller, then worked on search regex in the showAllPosts controller. 
Was confused on how to implement the search regex for author as it is in another referenced document. two methods : 1. find users and userId from User model and then find posts using author : {$in : userIds}and populate with user. 2. $lookup aggregate

day 22nd august
const posts = await Post.find({ author: { $in: userIds } })
the $in is used bcus suppose we have john and johnny in our db so both will be returned cus of the regex and thus we wud have an array of userids.

day 23rd august
$lookup vs populate() : 
populate() - mongoose level convenience that basically means i already have my posts go fetch the referenced users for me.
$lookup - mongodb aggregation which is a join that can manipulate/filter the combined data too. more powerful. uses localfield, foreignfield, etc. Used here bcus i wanna search posts by author but author is just a refenreced field in post model from the users model. so Post -> author ObjectId -> User -> username.

Fixed and added consistency to the API and tested using hopscotch, works well!. Used mongoose aggregates such as $lookup, $match, $unwind, $project.
Ok original task was a regex search on title/content but i did on title and author separately otherwise 
If you want to satisfy the original requirement exactly, you'd eventually do something like:
const posts = await Post.find({
  $or: [
    { title: { $regex: search, $options: "i" } },
    { content: { $regex: search, $options: "i" } }
  ]
});

Then /posts?search=javascript
would find a post if either its title OR content contains "javascript".

day 24th august
Onto the filtering by tag. It was returned empty arrays as the find function wasn't able to find docs due to the way tags were stored in the db - '['product', 'api']' bcus in models the tags: type : String, this was changed to [String] but then it was getting saved as ['product, api, web'] which is wrong as well. So i sent raw json and tags were like this [ "backend", "api", "webdev" ] and also i had to remove the user login info as only Post object could be sent, then switching to x-www-form-urlencoded for login and stuff made it difficult cus i had to retype and delete !
So I decided to use x-www-form-urlencoded and inside controller the data will convert the comma-separated string into an array. Therefore, mongoDB can correctly perform array-element matching.
updates.tags = updates.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
so map removes extra spaces and filter removes any empty values : if the user accidentally sends:
"javascript, backend, "
you don't end up with:
["javascript", "backend", ""]

now give data in ww-form-urlenced as productivyt, api, webdev and the db will have an array.

day 3rd sept
working on the mongoose middleware that deletes all comments related if a post is deleted - manual cascade delete. This wasn't working as the deletepost controller was using post.deleteOne() while the middleware was postScehma,post(findOneAndDelete'')..changed this to 'deleteOne' for the middleware to actually run.
with deleteOne() document middleware, the callback argument isn't the deleted document the same way findOneAndDelete middleware gets it. So the cleaner approach is to use the document middleware's this:

postSchema.post("deleteOne", async function () {
  await Comment.deleteMany({ post: this._id });
});....still wasn't working after so many trials, this._id was undefined bcus this refered to the query not the document. GPT recommended to remove the middleware and simply put this logic in the destroypost controller. Now it works.

day 5th September
added rate limiting to my project (new concept). the legacyHeaders : false means dont send older headers to the client and standardHeaders means send modern rateLimit information to the client like limit, remaining requests, reset info. 
Imagine someone has multiple IPv6 addresses within the same allocated network.
If you treated every individual IPv6 address separately, they could potentially get around the rate limit simply by changing addresses.
ipv6Subnet makes the limiter less easy to bypass through IPv6 address variation.

day 8th sept
just 2 lines of mongo sanitize and project completed.
Future scope: maybe shift this to fastAPI (beneficial?), add frontend and error handling and deploy.
