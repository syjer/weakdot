#library("storage");

#import('common.dart');
#import('dart:html');
#import('dart:json');



class _WeakDotStorageObservers {
  final Observable clear;
  
  _WeakDotStorageObservers() : clear = new Observable();
}

class WeakDotStorage {
  
  final _WeakDotStorageObservers on;
  
  WeakDotStorage() : on = new _WeakDotStorageObservers();
  
  List<String> listSlideNames() {
    final String slideNamesUnparsed = window.localStorage["SLIDE_NAMES"];
    final List<String> slideNames = slideNamesUnparsed != null ? JSON.parse(slideNamesUnparsed) : [];
    slideNames.sort((String a, String b) => a.compareTo(b));
    return slideNames;
  }
  
  void save(String name, String slide) {
    name = name.trim();
    final Set<String> slideNames = new Set<String>.from(listSlideNames());
    slideNames.add(name);
    window.localStorage["SLIDE_NAMES"] = JSON.stringify(new List<String>.from(slideNames));
    window.localStorage[name] = slide;
  }
  
  String loadSlide(String name) {
    return window.localStorage[name];
  }
  
  void clear() {
    try {
      window.localStorage.clear();
    } finally {
      on.clear.notifyObservers();
    }
  }
}