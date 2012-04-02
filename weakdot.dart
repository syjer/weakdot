#import('dart:html');
#import('markdown/lib.dart', prefix: 'markdown');


/* the use of a hide class is a temporary workaround*/
void show(String selector) {
  document.queryAll(selector).forEach((Element elem) => elem.classes.remove('hide') );
}

void hide(String selector) {
  document.queryAll(selector).forEach((Element elem) => elem.classes.add('hide') );
}

bool isHidden(String selector) {
  return document.query(selector).classes.contains('hide');
}
/* ------------ */



String buildSlides(String text) {
  final StringBuffer sb = new StringBuffer();
  
  //wrap each "slide" in a section tag
  markdown.markdownToHtml(text).split('<hr />').forEach((slide) {
    if (slide != null && slide.length > 0) {
      sb.add('<div class="slide-container"><div><section class="slide">').add(slide).add('</section></div></div>');
    }
  });
  
  return sb.toString();
}

void updateSlides() {
  final slides = buildSlides(document.query('#text').value);
  document.query('#slides_container').innerHTML = slides;
}

void handleKeysInSlideMode (KeyboardEvent event) {
  final Element selectedSlide = document.query('.selected-slide');
  switch(event.keyCode) {
  case 39: //right
    if (selectedSlide.nextElementSibling != null) {
      selectedSlide.classes.remove('selected-slide');
      selectedSlide.nextElementSibling.classes.add('selected-slide');
    }
    break;
  case 37: //left
    if (selectedSlide.previousElementSibling != null) {
      selectedSlide.classes.remove('selected-slide');
      selectedSlide.previousElementSibling.classes.add('selected-slide');
    }
    break;
  case 27: //esc 
    toggleEditMode(); 
    break;
  }
  event.preventDefault();
}

void toggleEditMode() {
  show('#edit_mode, #editor_zone');
  hide('#slide_mode');
  
  document.query('#slides_container').classes.add('preview_edit_mode');
  document.body.classes.remove('full');
  
  if (document.query('.selected-slide') != null) {
    document.query('.selected-slide').classes.remove('selected-slide');
  }
  
  document.on.keyDown.remove(handleKeysInSlideMode);
}


void toggleSlideMode() {
  hide('#edit_mode, #editor_zone');
  show('#slide_mode');

  document.query('#slides_container').classes.remove('preview_edit_mode');
  document.body.classes.add('full');
  
  if (document.query('.slide-container') != null) {
    document.queryAll('.slide-container').first.classes.add('selected-slide');
  }
  
  document.on.keyDown.add(handleKeysInSlideMode);
}

void prepareGui() {
  
  final showHideButton = document.query('#show_hide_preview_button');
  
  showHideButton.on.click.add((e) {
    if (isHidden('#slides_container')) {
      show('#slides_container');
      showHideButton.text = 'hide preview';
    } else {
      hide('#slides_container');
      showHideButton.text = 'show preview';
    }
  });
  
  document.query('#toggle_slide_mode_button').on.click.add((e) => toggleSlideMode());
  document.query('#toggle_edit_mode_button').on.click.add((e) => toggleEditMode());
  document.query('#text').on.keyUp.add((e)=> updateSlides());
}

void main() {
  prepareGui();
  toggleEditMode();
  updateSlides();
}
