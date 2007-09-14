Story.prototype.location_macro = function(param) {
   switch (this.online) {
      case 1:
      if (this.tags.size() > 0) {
         Html.link({href: this.tags.get(0).tag.href()}, "topic");
      }
      break;
      case 2:
      res.write("site");
      break;
   }
   return;
};

Story.prototype.topic_macro = function(param) {
   if (this.constructor !== Image && (!this.online || this.tags.size() < 1))
      return;
   var topic = this.tags.get(0).tag;
   if (!param.as || param.as == "text")
      res.write(topic.name);
   else if (param.as == "link") {
      Html.link({href: topic.href()}, param.text ? param.text : topic.name);
   } else if (param.as == "image") {
      if (!param.imgprefix) {
         param.imgprefix = "topic_";
      }
      var img = getPoolObj(param.imgprefix + topic.name, "images");
      if (img) {
         Html.openLink({href: topic.href()});
         renderImage(img.obj, param)
         Html.closeLink();
      }
   }
   return;
};

Story.prototype.topicchooser_macro = function(param) {
   var site = this.site || res.handlers.site;
   var currentTopic = this.tags.size() > 0 ? this.tags.get(0).tag : null;
   var topics = (this.constructor === Story ? site.stories.tags : 
         site.images.galleries);
   var options = [], topic;
   for (var i=0; i<topics.size(); i++) {
      topic = topics.get(i);
      options[i] = {value: topic.name, display: topic.name};
      if (req.data.addToTopic) {
         var selected = req.data.addToTopic;
      } else if (currentTopic === topic) {
         var selected = topic.name;
      }
   }
   Html.dropDown({name: "addToTopic"}, options, selected, param.firstOption);
   return;
};
