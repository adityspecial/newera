/*
 *  Functions that implement Blogger's XML-RPC API.
 */

/**
 * return story with passed id
 */
function getPost(appkey, postid, username, password) {
   var user = root.getUser(username,password);
   var story = this.storiesByID.get(postid.toString());
   if (!story)
      throwError ("Couldn't find the story with id " + postid);
   // check if user is allowed to edit this story
   if (story.isEditDenied(user,story.site.members.getMembershipLevel(user)))
      throwError ("You're not allowed to edit the story with id " + postid);
   var result = new Object();
   result.content = story.getContentPart("text");
   result.userid = story.creator.name;
   result.postid = story._id;
   result.dateCreated = story.createtime;
   return (result);
}

/**
 *  Utility function to parse the <title>title</title> out of a 
 *  Blogger API posting.
 */
function parseBloggerAPIPosting (param, content) {
   if (content.indexOf ("<title>") != 0)
      param.content_text = content;
   else {
      var endTitle = content.lastIndexOf ("</title>");
      if (endTitle > 0) {
         param.content_title = content.substring (7, endTitle);
         param.content_text = content.substring (endTitle+8); 
      } else
         param.content_text = content;
   }
}

/**
 * Create a new post after checking user credentials.
 */
function newPost (appkey, blogid, username, password, content, publish) {
   var user = root.getUser(username,password);
   var blog = this.getBlog(blogid.toString());
   // check if user is allowed to post a story
   if (blog.stories.isDenied(user,blog.members.getMembershipLevel(user)))
      throwError ("You don't have permission to post to this weblog");

   var param = new Object();
   this.parseBloggerAPIPosting (param, content);
   param.online = publish ? 2 : 0;
   var result = blog.stories.evalNewStory(new story(), param, user);
   if (result.error)
      throwError (result.message);
   return (result.id);
}

/**
 * Update an existing posting.
 */
function editPost (appkey, postid, username, password, content, publish) {
   var user = root.getUser(username,password);
   // FIXME: the collection storiesByID is a problem
   // because it contains all stories of all sites ...
   var story = this.storiesByID.get(postid.toString());
   if (!story)
      throwError ("Couldn't find the story with id " + postid);
   // check if user is allowed to edit the story
   if (story.isEditDenied(user,story.site.members.getMembershipLevel(user)))
      throwError ("You're not allowed to edit the story with id " + postid);
   var param = new Object();
   this.parseBloggerAPIPosting (param, content);
   story.title = param.content_title;
   story.setContentPart("title",param.content_title);
   story.setContentPart("text",param.content_text);
   story.online = publish ? 2 : 0;
   story.modifier = user;
   story.modifytime = new Date();
   story.site.lastupdate = story.modifytime;
   return true;
}

/**
 * Delete an existing posting. [ts]
 */
function deletePost(appkey, postid, username, password, publish) {
   var user = root.getUser(username,password);
   var story = this.storiesByID.get(postid.toString());
   if (!story)
      throwError ("Couldn't find the story with id " + postid);
   // check if user is allowed to delete the story
   if (story.isDeleteDenied(user,story.site.members.getMembershipLevel(user)))
      throwError ("You're not allowed to delete the story with id " + postid);
   var result = story._parent.deleteStory(story);
   return (!result.error);
}


/**
 * retrieve a list of n recent posts
 * see http://groups.yahoo.com/group/bloggerDev/message/225
 */
function getRecentPosts(appkey, blogid, username, password, numberOfPosts) {
   var user = this.getUser(username,password);
   var blog = this.getBlog(blogid.toString());
   // retrieve membership-level
   var level = blog.members.getMembershipLevel(user);

   var size = blog.stories.size();
   var limit = Math.min(numberOfPosts ? Math.min(numberOfPosts,20) : 20,size);
   var posts = new Array();
   var idx = 0;
   while (posts.length < limit && idx < size) {
      var story = blog.stories.get(idx++);
      if (story.isEditDenied(user,level))
         continue;
      var param = new Object();
      param.postid = story._id;
      param.userid = story.creator.name;
      param.dateCreated = story.createtime;
      if (story.title)
         param.content = "<title>"+story.title+"</title>"+
             story.getContentPart("text");
      else
         param.content = story.getContentPart("text");
      posts[posts.length] = param;
   }
   return (posts);
}

/**
 * function lists all sites a user is a member of
 * and allowed to add/edit stories
 */
function getUsersBlogs(appkey, username, password) {
   var user = root.getUser(username,password);
   var result = new Array();
   for (var i=0;i<user.size();i++) {
      var membership = user.get(i);
      var site = membership.site;
      if (site.stories.isDenied(user,membership.level))
         continue;
      var param = new Object();
      param.blogid = site.alias;
      param.blogname = site.title;
      param.url = site.href();
      result[result.length] = param;
   }
   return (result);
}

/**
 *  Blogger API function that retrieves a user's info. 
 *  See http://groups.yahoo.com/group/bloggerDev/message/315
 */
function getUserInfo(appkey, username, password) {
   var result = new Object();
   var user = this.getUser (username, password);
   if (user) {
      result.userid = username;
      result.nickname = username;
      result.email = user.email;
      result.url = user.url;
      result.firstname = "X";
      result.lastname = "YZ";
   }
   return result;
}


/**
 * function retrieves a userobject
 */
function getUser(username, password) {
   var user = root.users.get(username);
   if (!user)
      throwError ("User " + username + " does not exist on this server");
   if (user.password != password)
      throwError ("Authentication failed for user " + username);
   if (user.blocked)
      throwError ("Sorry, your account has been disabled.");
   return (user);
}

/**
 * function retrieves a weblog-object (aka site)
 */
function getBlog(blogid) {
   var blog = this.get (blogid.toString());
   if (!blog)
      throwError ("The weblog " + blogid + " doesn't exist on this server.");
   else if (blog.blocked)
      throwError ("The weblog " + blogid + " was disabled.");
   return (blog);
}
