/**
 * main action
 */
function main_action() {
   res.data.title = getMessage("PictureTopicMgr.mainTitle", {siteTitle: this._parent._parent.title});
   res.data.body = this.renderSkinAsString ("main");
   res.handlers.site.renderSkin("page");
   return;
}
