#library("slides");

#import('dart:html');
#import('common.dart');



class Slides {

  final Element _slidesShowContainer;
  
  //workaround for issue https://code.google.com/p/dart/issues/detail?id=144
  var _handleKeysInSlideModeHandler;
  var _resizeSlideHandler;
  
  Slides() : _slidesShowContainer = document.query("#slides_show") {
    _handleKeysInSlideModeHandler = _handleKeysInSlideMode;
    _resizeSlideHandler = (Event e) => _resizeSlide();
  }
  
  void show(String markdownText) {
    
    _slidesShowContainer.innerHTML = buildSlides(markdownText);
    
    showElements('#slide_mode, #slides_show');
    
    final CSSStyleDeclaration controlsStyle = document.query("#controls").style;
    controlsStyle.position = 'absolute';
    controlsStyle.left = '10px';
    
    document.body.classes.add('full');
    
    
    if (_slidesShowContainer.query('.slide-container') != null) {
      _slidesShowContainer.queryAll('.slide-container').first.classes.add('selected-slide');
    }
    
    document.on.keyDown.add(_handleKeysInSlideModeHandler);
    document.window.on.resize.add(_resizeSlideHandler);
    _resizeSlide();
  }
  
  void hide() {
    document.body.style.transform = ''; //
    hideElements('#slide_mode, #slides_show');
    
    document.query("#controls").style.position = '';
    
    document.body.classes.remove('full');
    
    if (document.query('#slides_show .selected-slide') != null) {
      document.query('#slides_show .selected-slide').classes.remove('selected-slide');
    }
    
    document.on.keyDown.remove(_handleKeysInSlideModeHandler);
    document.window.on.resize.remove(_resizeSlideHandler);
  }
  
  
  void _handleKeysInSlideMode (KeyboardEvent event) {
    final Element selectedSlide = document.query('#slides_show .selected-slide');
    switch(event.keyCode) {
    case 39: //right
      if (selectedSlide.nextElementSibling != null) {
        selectedSlide.classes.remove('selected-slide');
        selectedSlide.nextElementSibling.classes.add('selected-slide');
      }
      event.preventDefault();
      break;
    case 37: //left
      if (selectedSlide.previousElementSibling != null) {
        selectedSlide.classes.remove('selected-slide');
        selectedSlide.previousElementSibling.classes.add('selected-slide');
      }
      event.preventDefault();
      break;
    case 27: //esc 
      //toggleEditMode();
      event.preventDefault();
      break;
    }
  }
}


void _resizeSlide() {
  //rect return a future. see https://groups.google.com/a/dartlang.org/group/misc/browse_thread/thread/5587b66fe0d00bc5
  document.body.rect.then((ElementRect bodyRect) {
    final scale = 1.0 / Math.max(bodyRect.client.width/window.innerWidth, bodyRect.client.height/window.innerHeight);
    
    document.body.style.transform = 'scale(${scale})'; //CHECK don't work with IE9
  });
}

