/**
 * send a mail to confirm registration
 */

function sendConfirmationMail() {
	var mail = new Mail();
	mail.setFrom(getProperty("adminEmail"));
	mail.setTo(user.email);
	mail.setSubject("Welcome to Antville!");
	mail.setText(this.renderSkinAsString("regConfirm"));
	mail.send();

}


/**
 * check if user is blocked
 */

function isBlocked() {
   if (parseInt(user.blocked,10)) {
      res.message = "Sorry, you were blocked by an Administrator!";
      return true;
   } else
      return false;
}

/**
 * check if user owns a weblog
 * returns true|false
 */

function getWeblog() {
   if (user.weblog)
      return true;
   return false;
}