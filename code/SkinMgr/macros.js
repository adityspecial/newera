/**
 * macro renders filebased-skins as list
 */

function skins_macro(param) {
   for (var i in app.skinfiles) {
      res.write("<b>" + i + "</b>");
      for (var j in app.skinfiles[i]) {
         res.write("<li>");
         res.write("<a href=\"" + this.href() + "?proto=" + i + "&name=" + j + "\">");
         res.write(j);
         res.write("</a></li>");
      }
      res.write("<br>");
   }
}


/**
 * macro calls a form-skin for editing a skin-source
 */

function skineditor_macro(param) {
   if (req.data.proto && req.data.name) {
      var s = this.fetchSkin(req.data.proto,req.data.name);
      s.renderSkin("edit");
   }
}

/**
 * macro checks if the skin was modified or
 * is the default-skin
 */

function skinstatus_macro(param) {
   if (!param.proto || !param.name)
      return;
   var s = this.fetchSkin(param.proto,param.name);
   if (s.creator) {
      res.write("customized by " + s.creator.name);
      res.write("&nbsp;...&nbsp;");
      var linkParam = new Object();
      linkParam.to = "delete";
      s.openLink(linkParam);
      res.write("remove skin");
      this.closeLink();
   } else
      res.write("not customized");
}
