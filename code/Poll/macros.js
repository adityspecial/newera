/**
 * macro renders a poll's question
 * (either as text or editor)
 */
function question_macro(param) {
   if (param.as == "editor")
      Html.textArea(this.createInputParam("question", param));
   else
      res.write(this.question);
   return;
}


/**
 * macro renders one choice of a poll
 * (either as text or as editor)
 */
function choices_macro(param) {
   var vote;
   if (session.user && this.votes.get(session.user.name))
      vote = this.votes.get(session.user.name).choice;
   for (var i=0; i<this.size(); i++) {
      var choice = this.get(i);
      param.name = "choice";
      param.title = renderSkinAsString(createSkin(choice.title));
      param.value = choice._id;
      param.checked = "";
      if (choice == vote)
         param.checked = " checked=\"checked\"";
      res.write(choice.renderSkinAsString("main", param));
   }
}


/**
 * macro renders results of a poll as bar chart
 */
function results_macro(param2) {
   for (var i=0; i<this.size(); i++) {
      var c = this.get(i);
      var param = new Object();
      param.title = c.title;
      param.count = c.size();
      param.percent = 0;
      if (param.count > 0) {
         param.percent = param.count.toPercent(this.votes.size());
         param.width = Math.round(param.percent * 2.5);
         param.graph = c.renderSkinAsString("graph", param);
         if (param.count == 1)
            param.text = " " + (param2.one ? param2.one : "vote");
         else
            param.text = " " + (param2.more ? param2.more : "votes");
      } else
         param.text = " " + (param2.no ? param2.no : "votes");
      c.renderSkin("result", param);
   }
   return;
}


/**
 * macro renders totals of a poll
 */
function total_macro(param) {
   var n = this.votes.size();
   if (n == 0)
      n += " " + (param.no ? param.no : "votes");
   else if (n == 1)
      n += " " + (param.one ? param.one : "vote");
   else
      n += " " + (param.more ? param.more : "votes");
   return n;
}


/**
 * macro renders a link to the poll editor
 */
function editlink_macro(param) {
   if (session.user) {
      try {
         this.checkEdit(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.link({href: this.href("edit")},
                param.text ? param.text : "edit");
   }
   return;
}


/**
 * macro rendering a link to delete a poll
 * (only if the user also is the creator)
 */
function deletelink_macro(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      Html.link({href: this.href("delete")},
                param.text ? param.text : "delete");
   }
   return;
}


/**
 * macro renders a link to the poll
 */
function viewlink_macro(param) {
   try {
      if (!this.closed) {
         this.checkVote(session.user, req.data.memberlevel);
         Html.link({href: this.href()},
                   param.text ? param.text : "vote");
      }
   } catch (deny) {
      return;
   }
   return;
}


/**
 * macro renders a link as switch to close/re-open a poll
 */
function closelink_macro(param) {
   if (session.user) {
      try {
         this.checkDelete(session.user, req.data.memberlevel);
      } catch (deny) {
         return;
      }
      var str = this.closed ? "re-open" : "close";
      Html.link({href: this.href("toggle")},
                param.text ? param.text : str);
   }
   return;
}


/**
 * macro renders the time a poll was closed
 */
function closetime_macro(param) {
   if (this.closed) {
      if (!param.format)
         param.format = "short";
      res.write(formatTimestamp(this.modifytime, param.format));
   }
   return;
}
