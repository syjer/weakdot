#import('dart:html');

#import('weakdot/storage.dart');
#import('weakdot/slides.dart');
#import('weakdot/editor.dart');
#import('weakdot/githubloader.dart');

/* ------------ */

//FIXME this should be moved in the editor class: the selected value must be preserved!
void updateListSlideNames(WeakDotStorage storage) {
  final Element slideSelect = document.query("#slide_list");
  slideSelect.nodes.clear();
  storage.listSlideNames().forEach((slideName) {
    final Element slideNameElement = new Element.html('<option value="${slideName}">${slideName}</option>');
    slideSelect.nodes.add(slideNameElement);
  });
}

void prepareGui(WeakDotStorage storage, Editor editor, Slides slides) {
  
  final GithubLoader githubLoader = new GithubLoader(editor);
  
  updateListSlideNames(storage);
  
  storage.on.clear.add(() => updateListSlideNames(storage));
  editor.on.save.add(() => updateListSlideNames(storage));
  
  
  //on select slide.
  final SelectElement slideSelect = document.query("#slide_list");
  slideSelect.on.change.add((Event e) {
    final String value = slideSelect.value;
    print('slideSelect value is ${value}');
    editor.save();
    print('slideSelect value is ${slideSelect.value}');
    editor.load(value);
  });
  //
  
  //
  
  //
  document.query("#save_slide").on.click.add((e) => editor.save());
  //
  
  
  final showHideButton = document.query('#show_hide_preview_button');
  
  showHideButton.on.click.add((e) {
    if (editor.isSlidePreviewHidden()) {
      editor.showSlidePreview();
      showHideButton.text = 'hide preview';
    } else {
      editor.hideSlidePreview();
      showHideButton.text = 'show preview';
    }
  });
  
  document.query('#toggle_slide_mode_button').on.click.add((e) {
    editor.hide();
    slides.show(editor.value);
  });
  document.query('#toggle_edit_mode_button').on.click.add((e) {
    slides.hide();
    editor.show();
  });
  
  
  document.query("#clear_storage").on.click.add((e) {
    if(window.confirm("are you sure to clear all?")) {
      storage.clear();
    }
  });
  
  document.query("#load_template").on.click.add((e) => loadTemplate(editor));
  
  final InputElement githubUrl = document.query("#github_url");
  
  document.query("#github_load").on.click.add((e) => githubLoader.loadFromUri(githubUrl.value));
}

void main() {
  final WeakDotStorage storage = new WeakDotStorage();
  final Editor editor = new Editor(storage);
  final Slides slides = new Slides();
  
  prepareGui(storage, editor, slides);
  
  editor.show();
  slides.hide();
}

// template part
void loadTemplate(Editor editor) {
  editor.value = '''#slide title

some text. _em_ and __strong__.

or *em* and **strong**.

Add 3 dash for creating a new slide

---
#a slide appear! (with list)


- one
- two 
- three

inline  html work too:

<ol>
  <li>test
  <li>test2
</ol>

---
#quoting

> test sdfa f asd sf a
> dsfasfds sf
> fdsfasfd
>> test
> a''';
}


