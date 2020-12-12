/*
 * Find out the <a> tag contains an image and mark it.
 *
 */

$(function() {

  var MARK="img-hyperlink";

  $("a:has(img)").addClass(MARK);
  
});
