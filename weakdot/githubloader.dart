#library("githubloader");

#import('dart:json');
#import('dart:html');
#import('dart:uri');
#import('editor.dart');

/**
 imported from https://en.wikibooks.org/wiki/Algorithm_Implementation/Miscellaneous/Base64
*/
String base64Decode(String s) {
  //will not work on IE.
  return window.atob(s.replaceAll('\n', ''));
}


class GithubLoader {
  
  List<String> _resourcePathToConsume;
  Editor _editor;
  
  GithubLoader(Editor editor) {
    //install on message handler
    window.on.message.add(_dataReceived);
    _editor = editor;
  }
  
  
  _dataReceived(MessageEvent e) {
    var data = JSON.parse(e.data);
    
    //continue to dive...
    if(_resourcePathToConsume.length > 0) {
      var path = _resourcePathToConsume[0];
//  {
//      "type": "tree",
//      "url": "https://api.github.com/repos/syjer/weakdot/git/trees/35eb025a0f9ca4695ccd57a09fd1f6420cbba3dd",
//      "sha": "35eb025a0f9ca4695ccd57a09fd1f6420cbba3dd",
//      "path": "markdown",
//      "mode": "040000"
//    }
      
      var url = data['data']['tree'].filter((elem) => elem['path'] == path).last()['url'];
      _resourcePathToConsume.removeRange(0, 1);
      _doJsonPCall("${url}?callback=callbackForJsonpApi");
    } else {
      _editor.value = base64Decode(data['data']['content']); 
    }
  }

  //jsonp http://blog.sethladd.com/2012/03/jsonp-with-dart.html
  //
  //from https://github.com/syjer/weakdot/blob/master/markdown/README.txt
  // -> /syjer/weakdot/, /master/, [markdown, README.txt]
  // 
  //to https://api.github.com/repos/syjer/weakdot/git/trees/master
  // -> consume markdown
  // -> consume README.txt
  //
  String loadFromUri(String uri) {
    if(uri != "") {
      Uri resource = new Uri.fromString(uri);
      //handle case not raw
      
      var userAndRepo;
      var branch;
      var resourcePath;
      
      if (resource.domain == "github.com") {
        var splitted = resource.path.substring(1).split('/');
        userAndRepo = splitted[0]+'/'+splitted[1];
        branch = splitted[3];
        _resourcePathToConsume = splitted.getRange(4, splitted.length - 4);
      }      
      
      _doJsonPCall("https://api.github.com/repos/${userAndRepo}/git/trees/${branch}?callback=callbackForJsonpApi");
    }
  }
  
  void _doJsonPCall(String src) {
    ScriptElement script = new Element.tag("script");
    script.src = src;
    document.body.elements.add(script);
  }

}