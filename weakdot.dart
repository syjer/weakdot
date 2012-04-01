#import('dart:html');
#import('markdown/lib.dart', prefix: 'markdown');



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
  final slides = buildSlides(document.query("#text").value);
  document.query("#slides_container").innerHTML = slides;
}

void handleKeysInSlideMode (KeyboardEvent event) {
  final Element selectedSlide = document.query(".selected-slide");
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
  document.query("#edit_mode").classes.remove('hide');
  document.query("#editor_zone").classes.remove('hide');
  document.query("#slide_mode").classes.add('hide');
  
  
  document.query("#slides_container").classes.add("preview_edit_mode");
  document.body.classes.remove("full");
  
  if (document.query(".selected-slide") != null) {
    document.query(".selected-slide").classes.remove('selected-slide');
  }
  
  document.on.keyDown.remove(handleKeysInSlideMode);
}


void toggleSlideMode() {
  document.query("#edit_mode").classes.add('hide');
  document.query("#editor_zone").classes.add('hide');
  document.query("#slide_mode").classes.remove('hide');

  document.query("#slides_container").classes.remove("preview_edit_mode");
  document.body.classes.add("full");
  
  if (document.query(".slide-container") != null) {
    document.queryAll(".slide-container").first.classes.add('selected-slide');
  }
  
  
  document.on.keyDown.add(handleKeysInSlideMode);
}

void main() {
  
  final showHideButton = document.query("#show_hide_preview_button");
  
  showHideButton.on.click.add((e) {
    
    final Element slides_container = document.query("#slides_container");
    
    if (slides_container.classes.contains('hide')) {
      slides_container.classes.remove('hide');
      showHideButton.text = 'hide preview';
    } else {
      slides_container.classes.add('hide');
      showHideButton.text = 'show preview';
    }
  });
  
  
  document.query("#toggle_slide_mode_button").on.click.add((e) => toggleSlideMode());
  document.query("#toggle_edit_mode_button").on.click.add((e) => toggleEditMode());
  
  document.query("#text").on.keyUp.add((e)=> updateSlides());
  
  //
  toggleEditMode();
  updateSlides();
  
}
