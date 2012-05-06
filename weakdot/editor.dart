#library("editor");

#import('dart:html');
#import('common.dart');
#import('storage.dart' );


class Editor {
  
  final _EditorObservable on;
  final TextAreaElement _editor;
  final InputElement _titleElement;
  final Element _slidesPreviewContainer;
  final WeakDotStorage _storage;
  
  Editor(WeakDotStorage storage): 
    _editor = document.query("#text"), 
    _titleElement = document.query("#slide_title"),
    _storage = storage,
    _slidesPreviewContainer = document.query('#slides_container'),
    on = new _EditorObservable() {
    _editor.on.keyUp.add((e)=> on.change.notifyObservers());
    on.change.add(() => _slidesPreviewContainer.innerHTML = ('<div>' + buildSlides(this.value)) + '</div>');
    
    //
    _editor.on.keyUp.add(_centerCurrentlyEditedSlide);
    _editor.on.click.add(_centerCurrentlyEditedSlide);
    //
  }
  
  void _centerCurrentlyEditedSlide(e) {
    int currentSlide = slideCount(_editor.value == null ? "" : _editor.value.substring(0, _editor.selectionStart));
    Element container = document.query("#slides_container > div");
    container.$dom_scrollTop = 435 * (currentSlide -1 );  /* 435 = slide dimension*/
  }
  
  String get value() => _editor.value;
  
  set value(String value) {
    _editor.value = value;
    on.change.notifyObservers();
  }
  
  
  void save() {
    _storage.save(_titleElement.value, this.value);
    on.save.notifyObservers();
  }
  
  void load(String slideTitle) {
    _titleElement.value = slideTitle;
    this.value = _storage.loadSlide(slideTitle);
  }
  
  void show() {
    showElements('#edit_mode, #editing_area');
  }
  
  void hide() {
    hideElements('#edit_mode, #editing_area');
  }
  
  void showSlidePreview() {
    showElements('#slides_container');
  }
  
  void hideSlidePreview() {
    hideElements('#slides_container');
  }
  
  bool isSlidePreviewHidden() {
    return isHidden('#slides_container');
  }
  
}

class _EditorObservable {
  final Observable change;
  final Observable save;
  
  _EditorObservable() : change = new Observable(), save = new Observable();
}
