#library('common');
#import('dart:html');
#import('../markdown/markdown.dart', prefix: 'markdown');

class Observable {
  final List<Function> _observers;
  
  Observable() : _observers = new List<Function>();
  
  void add(Function observer) {
    _observers.add(observer);
  }
  
  //TODO add remove
  
  void notifyObservers([var obj]) {
    if(obj == null) {
      _observers.forEach((Function observer) => observer());
    } else {
      _observers.forEach((Function observer) => observer(obj));
    }
  }
}


/* the use of a hide class is a temporary workaround*/
void showElements(String selector) {
  document.queryAll(selector).forEach((Element elem) => elem.classes.remove('hide') );
}

void hideElements(String selector) {
  document.queryAll(selector).forEach((Element elem) => elem.classes.add('hide') );
}

bool isHidden(String selector) {
  return document.query(selector).classes.contains('hide');
}

int slideCount(String text) {
  return markdown.markdownToHtml(text).split('<hr />').length;
}


/**/
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
